# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    CustomTokenObtainPairSerializer, 
    UserRegistrationSerializer, 
    UserSerializer,
    RegisterSerializer,  # Add the new RegisterSerializer
    WholesalerRegistrationSerializer  # Add the new WholesalerRegistrationSerializer
)
from .permissions import (
    IsOwnerOrAdmin, IsAdmin, IsCustomer, IsSeller, 
    IsCustomerOrSeller, IsSellerOrAdmin
)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses email instead of username
    """
    serializer_class = CustomTokenObtainPairSerializer


class UserRegistrationView(generics.CreateAPIView):
    """
    View for user registration
    Creates a new user account, generates JWT tokens, and returns user data with tokens
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Handle user registration with automatic JWT token generation
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Save the user (password will be automatically hashed)
                user = serializer.save()
                
                # Generate JWT tokens for the newly created user
                token_serializer = CustomTokenObtainPairSerializer()
                refresh = token_serializer.get_token(user)
                access_token = refresh.access_token
                
                # Prepare response data with tokens
                response_data = {
                    'success': True,
                    'message': 'User registered successfully',
                    'user': {
                        'id': user.id,
                        'name': user.name,
                        'email': user.email,
                        'user_type': user.user_type,
                        'is_active': user.is_active,
                        'date_joined': user.date_joined.isoformat()
                    },
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # If serializer is not valid, return validation errors
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """
    Simple registration view using RegisterSerializer
    Accepts: name, email, password, confirm_password
    Returns: user's basic info (id, name, email)
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """
        Handle user registration
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Save the user (password will be automatically hashed)
                user = serializer.save()
                
                # Return user's basic info as specified
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'user': serializer.to_representation(user)  # Returns id, name, email
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # If serializer is not valid, return validation errors
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class RegisterAPIView(APIView):
    """
    RegisterAPIView using APIView for user registration
    
    POST /api/register/
    - Validates data using RegisterSerializer
    - On success: returns status 201 and user data
    - On failure: returns errors like "Email already exists"
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle POST request for user registration
        """
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Save the user (password will be automatically hashed)
                user = serializer.save()
                
                # Return user's basic info (id, name, email) with 201 status
                return Response({
                    'success': True,
                    'message': 'User registered successfully',
                    'user': serializer.to_representation(user)
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                # Handle any unexpected errors during user creation
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Return validation errors with detailed messages
        errors = serializer.errors
        
        # Customize error messages for better user experience
        formatted_errors = {}
        for field, error_list in errors.items():
            if field == 'email' and any('already exists' in str(error) for error in error_list):
                formatted_errors[field] = ['Email already exists']
            elif field == 'confirm_password':
                formatted_errors[field] = error_list
            else:
                formatted_errors[field] = error_list
        
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': formatted_errors
        }, status=status.HTTP_400_BAD_REQUEST)


class WholesalerRegistrationAPIView(generics.CreateAPIView):
    """
    API endpoint for wholesaler registration
    
    POST /api/auth/register/wholesaler/
    - Creates User with user_type='WHOLESALER'
    - Creates associated WholesalerProfile with business information
    - Automatically logs in the user and returns JWT tokens
    - Returns user data with profile info and tokens
    """
    queryset = User.objects.all()
    serializer_class = WholesalerRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        """
        Override perform_create to handle post-creation logic
        """
        # Save the user and profile
        user = serializer.save()
        
        # Store user for token generation in create method
        self.created_user = user
        
        return user

    def create(self, request, *args, **kwargs):
        """
        Handle wholesaler registration with automatic login
        """
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Create user and wholesaler profile
                self.perform_create(serializer)
                user = self.created_user
                
                # Generate JWT tokens for automatic login
                token_serializer = CustomTokenObtainPairSerializer()
                refresh = token_serializer.get_token(user)
                access_token = refresh.access_token
                
                # Prepare response data with tokens
                response_data = {
                    'success': True,
                    'message': 'Wholesaler registration successful. Your application is pending admin approval.',
                    'user': serializer.to_representation(user),
                    'tokens': {
                        'access': str(access_token),
                        'refresh': str(refresh)
                    }
                }
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'success': False,
                    'message': 'Registration failed',
                    'error': str(e)
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Return validation errors
        return Response({
            'success': False,
            'message': 'Validation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    View for retrieving and updating user profile
    Users can only access their own profile, admins can access any profile
    """
    serializer_class = UserSerializer
    permission_classes = [IsOwnerOrAdmin]

    def get_object(self):
        # If admin, they can access any user profile via URL parameter
        if (hasattr(self.request.user, 'user_type') and 
            self.request.user.user_type == 'ADMIN'):
            user_id = self.kwargs.get('pk')
            if user_id:
                return generics.get_object_or_404(User, pk=user_id)
        
        # Regular users can only access their own profile
        return self.request.user


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Custom registration view that returns user data along with JWT tokens
    """
    serializer = UserRegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Create the user
            user = serializer.save()
            
            # Generate JWT tokens using the same method as login
            token_serializer = CustomTokenObtainPairSerializer()
            refresh = token_serializer.get_token(user)
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'user_type': user.user_type,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat()
                },
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh)
                }
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Registration failed',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'success': False,
        'message': 'Validation failed',
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Custom login view that returns user data along with tokens
    """
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(email=email, password=password)
    
    if user:
        if user.is_active:
            token_serializer = CustomTokenObtainPairSerializer()
            refresh = token_serializer.get_token(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'User account is disabled'
            }, status=status.HTTP_401_UNAUTHORIZED)
    else:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# Additional permission-based views
@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    """
    Admin-only dashboard with system statistics
    """
    stats = {
        'total_users': User.objects.count(),
        'total_customers': User.objects.filter(user_type='CUSTOMER').count(),
        'total_sellers': User.objects.filter(user_type='SELLER').count(),
        'total_admins': User.objects.filter(user_type='ADMIN').count(),
        'active_users': User.objects.filter(is_active=True).count(),
        'inactive_users': User.objects.filter(is_active=False).count(),
    }
    
    return Response({
        'message': f'Welcome Admin {request.user.name}',
        'user_type': request.user.user_type,
        'statistics': stats,
        'permissions': {
            'can_manage_users': True,
            'can_view_analytics': True,
            'can_modify_system_settings': True
        }
    })


@api_view(['GET'])
@permission_classes([IsSeller])
def seller_dashboard(request):
    """
    Seller-only dashboard
    """
    return Response({
        'message': f'Welcome Seller {request.user.name}',
        'user_type': request.user.user_type,
        'available_actions': [
            'manage_products',
            'view_sales_analytics', 
            'update_inventory',
            'respond_to_customer_queries'
        ],
        'permissions': {
            'can_create_products': True,
            'can_manage_own_products': True,
            'can_view_own_orders': True
        }
    })


@api_view(['GET'])
@permission_classes([IsCustomer])
def customer_dashboard(request):
    """
    Customer-only dashboard
    """
    return Response({
        'message': f'Welcome {request.user.name}',
        'user_type': request.user.user_type,
        'available_actions': [
            'browse_products',
            'place_orders',
            'track_orders',
            'manage_addresses',
            'view_order_history'
        ],
        'permissions': {
            'can_place_orders': True,
            'can_write_reviews': True,
            'can_manage_own_profile': True
        }
    })


@api_view(['GET']) 
@permission_classes([IsSellerOrAdmin])
def seller_or_admin_view(request):
    """
    View accessible by both sellers and admins with different data
    """
    if request.user.user_type == 'SELLER':
        data = {
            'dashboard_type': 'seller',
            'message': 'Seller analytics and management',
            'data': {
                'products_count': 0,  # Would query seller's products
                'orders_count': 0,    # Would query seller's orders
                'revenue': 0.0        # Would calculate seller's revenue
            }
        }
    else:  # Admin
        data = {
            'dashboard_type': 'admin',
            'message': 'Platform-wide analytics and management',
            'data': {
                'total_products': 0,   # Would query all products
                'total_orders': 0,     # Would query all orders  
                'platform_revenue': 0.0,  # Would calculate total revenue
                'user_growth': {}      # Would calculate user growth metrics
            }
        }
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsCustomerOrSeller])
def marketplace_view(request):
    """
    Marketplace view for customers and sellers (different perspectives)
    """
    if request.user.user_type == 'CUSTOMER':
        return Response({
            'view_type': 'customer_marketplace',
            'message': 'Browse and purchase products',
            'featured_products': [],  # Would return featured products
            'categories': [],         # Would return product categories
            'recommendations': []     # Would return personalized recommendations
        })
    else:  # Seller
        return Response({
            'view_type': 'seller_marketplace',
            'message': 'Analyze market and competition',
            'market_trends': [],      # Would return market analysis
            'competitor_analysis': [], # Would return competitor data
            'pricing_suggestions': [] # Would return pricing recommendations
        })


class AdminUserListView(generics.ListCreateAPIView):
    """
    Admin-only view to list and create users
    """
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    
    def get_queryset(self):
        return User.objects.all()
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'message': 'User list (Admin access)',
            'count': queryset.count(),
            'users': serializer.data
        })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_profile_view(request):
    """
    Get current user profile
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
