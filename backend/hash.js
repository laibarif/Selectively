const bcrypt = require('bcrypt');

const password = 'admin'; // The password you want to hash
const saltRounds = 10; // Salt rounds (higher is more secure, but slower)

bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Hashed Password:', hashedPassword);
});
