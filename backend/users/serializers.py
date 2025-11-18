# users/serializers.py
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.db import transaction
from .models import User, WholesalerProfile, AffiliateProfile


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that uses email instead of username
    """
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field] = serializers.EmailField()
        self.fields['password'] = serializers.CharField()

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['name'] = user.name
        token['user_type'] = user.user_type
        
        return token

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(request=self.context.get('request'),
                              email=email, password=password)
            
            if not user:
                raise serializers.ValidationError(
                    'No active account found with the given credentials'
                )
            
            if not user.is_active:
                raise serializers.ValidationError(
                    'User account is disabled.'
                )

        else:
            raise serializers.ValidationError(
                'Must include "email" and "password".'
            )

        refresh = self.get_token(user)

        # Get wholesaler status if user is a wholesaler
        wholesaler_status = None
        if user.user_type == 'WHOLESALER':
            try:
                if hasattr(user, 'wholesaler_profile'):
                    wholesaler_status = user.wholesaler_profile.approval_status
                else:
                    wholesaler_status = 'PENDING'
            except:
                wholesaler_status = 'PENDING'
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'user_type': user.user_type,
                'wholesaler_status': wholesaler_status,
                'is_active': user.is_active,
                'date_joined': user.date_joined.isoformat()
            },
            'message': 'Login successful'
        }


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration
    """
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Enter the same password as before, for verification"
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'user_type', 'password_confirm')
        extra_kwargs = {
            'email': {
                'help_text': 'Enter a valid email address',
                'error_messages': {
                    'unique': 'A user with this email already exists.',
                }
            },
            'name': {
                'help_text': 'Enter your full name',
                'max_length': 255
            },
            'user_type': {
                'help_text': 'Select user type',
                'default': 'CUSTOMER'
            }
        }

    def validate_email(self, value):
        """
        Check that the email is not already in use
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate_password(self, value):
        """
        Validate password strength
        """
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        # Check for at least one letter and one number
        if not any(c.isalpha() for c in value):
            raise serializers.ValidationError("Password must contain at least one letter.")
        if not any(c.isdigit() for c in value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value

    def validate(self, attrs):
        """
        Check that the two password entries match
        """
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password and password_confirm and password != password_confirm:
            raise serializers.ValidationError({
                'password_confirm': "The two password fields didn't match."
            })
        
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance with encrypted password
        """
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Create user with the custom manager which handles password hashing
        user = User.objects.create_user(password=password, **validated_data)
        return user


class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration with name, email, password, and confirm_password
    """
    password = serializers.CharField(
        write_only=True, 
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long"
    )
    confirm_password = serializers.CharField(
        write_only=True,
        style={'input_type': 'password'},
        help_text="Enter the same password as before, for verification"
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'confirm_password')
        extra_kwargs = {
            'email': {
                'help_text': 'Enter a valid email address',
                'error_messages': {
                    'unique': 'A user with this email already exists.',
                }
            },
            'name': {
                'help_text': 'Enter your full name',
                'max_length': 255
            }
        }

    def validate_email(self, value):
        """
        Check that the email is not already in use
        """
        if User.objects.filter(email=value.lower()).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value.lower()

    def validate(self, attrs):
        """
        Check that the password and confirm_password match
        """
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        if password and confirm_password and password != confirm_password:
            raise serializers.ValidationError({
                'confirm_password': "The password fields didn't match."
            })
        
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance with hashed password
        Returns user's basic info (id, name, email)
        """
        # Remove confirm_password from validated_data as it's not needed for user creation
        validated_data.pop('confirm_password')
        password = validated_data.pop('password')
        
        # Create user with hashed password using the custom manager
        user = User.objects.create_user(password=password, **validated_data)
        return user

    def to_representation(self, instance):
        """
        Return user's basic info (id, name, email) after successful registration
        """
        return {
            'id': instance.id,
            'name': instance.name,
            'email': instance.email
        }


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'name', 'user_type', 'is_active', 'date_joined')
        read_only_fields = ('id', 'date_joined')


class WholesalerRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for wholesaler registration that creates both User and WholesalerProfile
    """
    # User fields
    email = serializers.EmailField()
    name = serializers.CharField(max_length=255)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, min_length=8)
    
    # WholesalerProfile fields
    business_name = serializers.CharField(max_length=255)
    business_type = serializers.CharField(max_length=100, required=False, allow_blank=True)
    trade_license = serializers.FileField()
    
    class Meta:
        model = User
        fields = ('email', 'name', 'phone', 'password', 'business_name', 'business_type', 'trade_license')
    
    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value
    
    def validate_trade_license(self, value):
        """Validate trade license file upload"""
        if value:
            # Check file size (max 5MB)
            if value.size > 5 * 1024 * 1024:
                raise serializers.ValidationError(
                    'Trade license file size cannot exceed 5MB.'
                )
            
            # Check file type (allow common document formats)
            allowed_extensions = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']
            file_extension = value.name.split('.')[-1].lower()
            
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError(
                    f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'
                )
        return value
    
    @transaction.atomic
    def create(self, validated_data):
        """Create User and WholesalerProfile in a single transaction"""
        # Extract WholesalerProfile data
        business_name = validated_data.pop('business_name')
        business_type = validated_data.pop('business_type', '')
        trade_license = validated_data.pop('trade_license')
        
        # Create User with WHOLESALER type
        user = User.objects.create_user(
            email=validated_data['email'],
            name=validated_data['name'],
            phone=validated_data.get('phone', ''),
            password=validated_data['password'],
            user_type='WHOLESALER'
        )
        
        # Create WholesalerProfile with initial status 'PENDING'
        wholesaler_profile = WholesalerProfile.objects.create(
            user=user,
            business_name=business_name,
            business_type=business_type,
            trade_license=trade_license,
            approval_status='PENDING'
        )
        
        # Add profile to user instance for response
        user.wholesaler_profile = wholesaler_profile
        
        return user
    
    def to_representation(self, instance):
        """Custom representation including profile data"""
        return {
            'id': instance.id,
            'email': instance.email,
            'name': instance.name,
            'phone': instance.phone,
            'user_type': instance.user_type,
            'date_joined': instance.date_joined.isoformat(),
            'wholesaler_profile': {
                'business_name': instance.wholesaler_profile.business_name,
                'business_type': instance.wholesaler_profile.business_type,
                'approval_status': instance.wholesaler_profile.approval_status,
                'created_at': instance.wholesaler_profile.created_at.isoformat(),
            }
        }
