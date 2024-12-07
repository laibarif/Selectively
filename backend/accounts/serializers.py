from rest_framework import serializers
from .models import CustomUser, Child, OTPVerification
from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.contrib.auth import authenticate
from .models import CustomUser


class ChildSerializer(serializers.ModelSerializer):
    class Meta:
        model = Child
        fields = ['first_name', 'last_name', 'grade', 'school']


class CustomUserSerializer(serializers.ModelSerializer):
    children = ChildSerializer(many=True)
    otp = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'phone_number', 'email', 'password', 'children', 'otp']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_otp(self, value):
        email = self.initial_data.get('email')
        phone = self.initial_data.get('phone_number')

        if not email and not phone:
            raise serializers.ValidationError("Either email or phone number is required for OTP validation.")
        
        otp_record = OTPVerification.objects.filter(
            (Q(email=email) | Q(phone=phone)),
            otp=value
        ).first()

        if not otp_record:
            raise serializers.ValidationError("Invalid OTP.")
        
        if not otp_record.is_valid():
            raise serializers.ValidationError("OTP has expired.")
        
        if otp_record.is_used:
            raise serializers.ValidationError("OTP has already been used.")
        
        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    # def validate_phone_number(self, value):
        # if CustomUser.objects.filter(phone_number=value).exists():
        #     raise serializers.ValidationError("A user with this phone number already exists.")
        # return value

    @transaction.atomic
    def create(self, validated_data):
        children_data = validated_data.pop('children')
        otp = validated_data.pop('otp')

        # Ensure that 'first_name' and 'last_name' are provided in the request
        if not validated_data.get('first_name') or not validated_data.get('last_name'):
            raise serializers.ValidationError({
                'first_name': 'First name is required.',
                'last_name': 'Last name is required.'
        })
        # Create user
        user = CustomUser.objects.create_user(**validated_data)

        # Create children records
        for child_data in children_data:
            Child.objects.create(parent=user, **child_data)
        
        # Mark OTP as used (optional, depending on your logic)
        otp_record = OTPVerification.objects.filter(email=validated_data['email'], otp=otp).first()
        if otp_record:
            otp_record.is_used = True
            otp_record.save()

        return user

class LoginSerializer(serializers.Serializer):
    email_or_username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, data):
        email_or_username = data.get('email_or_username')
        password = data.get('password')

        # Check if the provided value is an email or username
        if '@' in email_or_username:
            # If it's an email, find the user by email
            user = CustomUser.objects.filter(email=email_or_username).first()
        else:
            # If it's a username, find the user by username
            user = CustomUser.objects.filter(username=email_or_username).first()

        # If no user found or password doesn't match
        if user is None or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials. Please check your username/email and password.")

        return {"user": user}