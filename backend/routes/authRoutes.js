const express = require('express');
const bcrypt = require('bcryptjs');
const speakeasy = require('speakeasy');
const nodemailer = require('nodemailer');
const db = require('../config/db');

const router = express.Router();
const jwt = require('jsonwebtoken');

// Utility function to execute queries with promises
const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// Route to check username availability
router.get('/check-username', async (req, res) => {
  const { username } = req.query;
console.log(username)
  if (!username) {
    return res.status(400).json({ message: 'Username is required.' });
  }

  try {
    const [results] = await db.query('SELECT * FROM users WHERE first_name = ?', [username]);

    if (results.length > 0) {
      return res.status(200).json({ available: false, message: 'Username is already taken.' });
    } else {
      return res.status(200).json({ available: true, message: 'Username is available.' });
    }
  } catch (error) {
    console.error('Error checking username availability:', error);
    return res.status(500).json({ message: 'Database error.' });
  }
});

// Route to handle user registration (Signup)
router.post('/signup', async (req, res) => {
  const { parent, children, terms } = req.body;

  console.log('Children Data:', children);

  // Basic validation
  if (
    !parent ||
    !parent.firstName ||
    !parent.lastName ||
    !parent.phone ||
    !parent.email
  ) {
    return res.status(400).json({ message: 'Please provide all required parent details.' });
  }

  let connection;

  try {
    // Get a transaction-capable connection
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if username is already taken
    const [existingUsers] = await connection.query(
      'SELECT * FROM children WHERE username = ?',
      [children[0]?.username] // Access the first child's username
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username already taken.' });
    }

    // Insert parent into the database
    const [parentResult] = await connection.query(
      'INSERT INTO users (first_name, last_name, phone, email) VALUES (?, ?, ?, ?)',
      [parent.firstName, parent.lastName, parent.phone, parent.email]
    );

    const parentId = parentResult.insertId;

    // Insert children details
    for (const child of children) {
      if (!child.firstName || !child.lastName || !child.grade || !child.username || !child.password) {
        throw new Error('Child details are incomplete.');
      }

      // Hash child's password
      const childHashedPassword = await bcrypt.hash(child.password, 10);

      await connection.query(
        'INSERT INTO children (parent_id, first_name, last_name, grade, school, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [parentId, child.firstName, child.lastName, child.grade, child.school || null, child.username, childHashedPassword]
      );

      console.log('Child added:', child);
    }

    // Generate 2FA secret
    const secret = speakeasy.generateSecret({ length: 20 });

    // Store 2FA secret in the database
    await connection.query('UPDATE users SET two_fa_secret = ? WHERE id = ?', [secret.base32, parentId]);

    // Generate OTP
    const otpCode = speakeasy.totp({
      secret: secret.base32,
      encoding: 'base32',
      step: 600, // 10 minutes validity
    });

    // Store OTP and expiry in the database
    await connection.query(
      'UPDATE users SET two_fa_otp = ?, two_fa_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
      [otpCode, parentId]
    );

    // Commit transaction
    await connection.commit();

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Your Hostinger email password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: parent.email,
      subject: 'Your 2FA OTP Code',
      text: `Thank you for registering. Your One-Time Password (OTP) for 2FA is: ${otpCode}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending 2FA email:', err);
        return res.status(500).json({ message: 'Failed to send 2FA email.' });
      }
      res.status(200).json({ message: 'Registration successful, 2FA OTP sent to your email.' });
    });
  } catch (error) {
    // Rollback transaction in case of error
    if (connection) {
      await connection.rollback();
    }
    console.error('Error during signup:', error);
    res.status(500).json({ message: error.message || 'Signup failed. Please try again.' });
  } finally {
    // Release the connection back to the pool
    if (connection) {
      await connection.release();
    }
  }
});



// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
  const { emailforverifyotp, otp } = req.body;
console.log(emailforverifyotp,otp)
  if (!emailforverifyotp || !otp) {
    return res.status(400).json({ message: 'Username and OTP are required.' });
  }

  try {
    // Fetch user by username
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [emailforverifyotp]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid firstName or OTP.' });
    }

    const user = users[0];

    // Check if OTP matches and is not expired
    if (
      user.two_fa_otp === otp 
      
    ) {
      console.log("ENter")
      // OTP is valid
      // Mark 2FA as verified and clear OTP fields
      await db.query(
        'UPDATE users SET two_fa_verified = 1, two_fa_otp = NULL, two_fa_otp_expiry = NULL WHERE id = ?',
        [user.id]
      );
      console.log("Query",db.query)
      res.status(200).json({ message: 'OTP verified successfully.' });
    } else {
      res.status(400).json({ message: 'Invalid or expired OTP.' });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Error verifying OTP. Please try again.' });
  }
});

// Route to send OTP (resend feature)
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  console.log(email);

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    // Fetch user by email
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'No user found with this email.' });
    }

    const user = users[0];

    // Generate new OTP
    const otpCode = speakeasy.totp({
      secret: user.two_fa_secret,
      encoding: 'base32',
      step: 600, // 10 minutes validity
    });
    try{
    // Update OTP and expiry
    await db.query(
      'UPDATE users SET two_fa_otp = ?, two_fa_otp_expiry = DATE_ADD(NOW(), INTERVAL 10 MINUTE) WHERE id = ?',
      [otpCode, user.id]
    );
    console.log("Verified");
  }
    catch{
      console.log("Not Verified");
    }
 const transporter = nodemailer.createTransport({
       host: "smtp.hostinger.com",
       port: 465,
       secure: true,
       auth: {
         user: process.env.EMAIL_USER,
         pass: process.env.EMAIL_PASSWORD // Your Hostinger email password
       }
     });


    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your 2FA OTP Code',
      text: `Your new One-Time Password (OTP) for 2FA is: ${otpCode}. It is valid for 10 minutes.`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending 2FA email:', err);
        return res.status(500).json({ message: 'Failed to send 2FA email.' });
      }
      res.status(200).json({ message: '2FA OTP sent to your email.' });
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Error sending OTP. Please try again.' });
  }
});


router.post('/login', async (req, res) => {
  const { email_or_username, password } = req.body;
  if (!email_or_username || !password) {
    return res.status(400).json({ message: 'Username/Email and Password are required.' });
  }

  const connection = db; // Use promise-based queries

  try {
    let user = null;
    let role = null;

    // Check in the admin table
    const [admins] = await connection.query(
      'SELECT * FROM admin WHERE username = ? OR email = ?',
      [email_or_username, email_or_username]
    );
    

    // Check in the children table
    const [children] = await connection.query(
      'SELECT * FROM children WHERE username = ? ',
      [email_or_username, email_or_username]
    );
   

    // Determine the role and user
    if (admins.length > 0) {
      user = admins[0];
      role = 'admin';
      console.log('Role assigned: admin');
    } else if (children.length > 0) {
      user = children[0];
      role = 'student';
      console.log('Role assigned: student');
    }

    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

   // Generate access token and refresh token
   const accessToken = jwt.sign(
    { childrenId: user.id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
);

const refreshToken = jwt.sign(
    { childrenId: user.id, children: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);

    res.status(200).json({
      message: 'Login successful',
      access: accessToken,
      refresh: refreshToken,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        role: role,
        email: user.email || null,
      },
    });

    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;