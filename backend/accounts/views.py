from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from twilio.rest import Client
import random
from django.core.mail import send_mail
from .models import OTPVerification
from django.conf import settings
from .serializers import CustomUserSerializer
import logging
from datetime import timedelta
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import LoginSerializer
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

# Generate OTP and send it via SMS
def send_otp_sms(phone, otp):
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    client = Client(account_sid, auth_token)
    message = client.messages.create(
        body=f"Your OTP code is: {otp}",
        from_=settings.TWILIO_PHONE_NUMBER,
        to=phone
    )
    return message.sid

# Generate OTP and send it via email
def send_otp_email(email, otp):
    send_mail(
        'Your OTP Code',
        f'Your OTP code is {otp}',
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

# View to send OTP to the user (SMS or Email)
@api_view(['POST'])
def send_otp(request):
    parent_data = request.data  # or request.data.get('your_key') if nested

    # Extract email and phone from the incoming request
    email = parent_data.get('email')
    phone = parent_data.get('phone')
    
    if not phone and not email:
        return Response({"error": "Phone or email is required"}, status=status.HTTP_400_BAD_REQUEST)

    # Generate OTP
    otp = random.randint(100000, 999999)

    # Save OTP to database (for later verification)
    if phone:
        OTPVerification.objects.create(phone=phone, otp=otp)
    elif email:
        OTPVerification.objects.create(email=email, otp=otp)

    # Send OTP to the user via SMS or email
    if phone:
        send_otp_sms(phone, otp)
    if email:
        send_otp_email(email, otp)

    return Response({"message": "OTP sent to your phone/email."}, status=status.HTTP_200_OK)

# View to handle the signup process
@api_view(['POST'])
def signup(request):
    logger.info(f"Signup request received: {request.data}")

    # Serializer instance to validate and save data
    serializer = CustomUserSerializer(data=request.data)
    
    if not serializer.is_valid():
        logger.error(f"Serializer validation failed: {serializer.errors}")
        return Response({"error": "Invalid data", "details": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    # If valid, proceed to create the user
    user = serializer.save()
    return Response({"message": "User created successfully!"}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def login(request):
    print("Received Data:", request.data)  # Add this line for debugging
    serializer = LoginSerializer(data=request.data)

    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT token
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'refresh': str(refresh),
            'access': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_200_OK)
    else:
        print("Serializer errors:", serializer.errors)  # Add this line to check errors
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
