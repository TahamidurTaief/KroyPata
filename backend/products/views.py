# products/views.py
import logging
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from .models import Product, Category, SubCategory, Color, Brand, Size, LandingPageOrder
from django.db.models import Count
from .serializers import (ProductSerializer, CategorySerializer, SubCategorySerializer, 
                          ColorSerializer, BrandSerializer, SizeSerializer,
                          LandingPageOrderSerializer, LandingPageOrderListSerializer)
from .permissions import IsShopOwnerOrReadOnly
from .filters import ProductFilter

# Set up logging
logger = logging.getLogger(__name__)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductViewSet(viewsets.ModelViewSet):
    # Comprehensive N+1 query optimization with select_related and prefetch_related
    queryset = Product.objects.filter(is_active=True).select_related(
        'shop',
        'brand',
        'sub_category',
        'sub_category__category',
        'shipping_category'
    ).prefetch_related(
        'colors',
        'sizes',
        'reviews__user',
        'specifications',
        'additional_images',
        'shipping_category__allowed_shipping_methods',
        'shipping_category__allowed_shipping_methods__shipping_tiers'
    ).order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]  # Changed to AllowAny for public read access
    filterset_class = ProductFilter
    lookup_field = 'slug'
    pagination_class = StandardResultsSetPagination

    def get_permissions(self):
        """
        Override to apply different permissions based on the action.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Write operations require custom permission
            self.permission_classes = [IsShopOwnerOrReadOnly]
        else:
            # Read operations are public
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        """
        Override list method to add proper error handling and logging.
        """
        try:
            logger.info(f"ProductViewSet.list called with params: {request.query_params}")
            
            # Get the queryset
            queryset = self.filter_queryset(self.get_queryset())
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                logger.info(f"Successfully paginated {len(page)} products")
                return self.get_paginated_response(serializer.data)
            
            # If no pagination
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Successfully returned {len(queryset)} products")
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in ProductViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve method to add proper error handling and logging.
        """
        try:
            logger.info(f"ProductViewSet.retrieve called with slug: {kwargs.get('slug')}")
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            logger.info(f"Successfully retrieved product: {instance.name}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ProductViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # Assumes a user has a one-to-one relationship with a shop
        if hasattr(self.request.user, 'shop'):
            serializer.save(shop=self.request.user.shop)
        else:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("You do not have a shop to add products to.")

class CategoryViewSet(viewsets.ModelViewSet):
    # Annotate with product & subcategory counts for richer frontend data
    # Prefetch subcategories to avoid N+1 queries
    queryset = Category.objects.prefetch_related('subcategories').annotate(
        total_products=Count('subcategories__products', distinct=True),
        sub_category_count=Count('subcategories', distinct=True)
    ).order_by('name')
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"CategoryViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} categories")
            return response
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"CategoryViewSet.retrieve called with slug: {kwargs.get('slug')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved category")
            return response
        except Exception as e:
            logger.error(f"Error in CategoryViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

class SubCategoryViewSet(viewsets.ModelViewSet):
    # Optimize with select_related to avoid N+1 queries
    queryset = SubCategory.objects.select_related('category').order_by('category__name', 'name')
    serializer_class = SubCategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Filter subcategories based on category if provided
        """
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        
        if category:
            # Filter subcategories that belong to the specified category
            queryset = queryset.filter(category__slug=category)
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"SubCategoryViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} subcategories")
            return response
        except Exception as e:
            logger.error(f"Error in SubCategoryViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"SubCategoryViewSet.retrieve called with slug: {kwargs.get('slug')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved subcategory")
            return response
        except Exception as e:
            logger.error(f"Error in SubCategoryViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class ColorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Color.objects.all().order_by('name')
    serializer_class = ColorSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Filter colors based on category if provided
        """
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        
        if category:
            # Filter colors that have products in the specified category
            queryset = queryset.filter(
                products__sub_category__category__slug=category
            ).distinct()
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"ColorViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} colors")
            return response
        except Exception as e:
            logger.error(f"Error in ColorViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"ColorViewSet.retrieve called with id: {kwargs.get('pk')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved color")
            return response
        except Exception as e:
            logger.error(f"Error in ColorViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.filter(is_active=True).order_by('name')
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        """
        Filter brands based on category if provided
        """
        queryset = super().get_queryset()
        category = self.request.query_params.get('category', None)
        
        if category:
            # Filter brands that have products in the specified category
            queryset = queryset.filter(
                products__sub_category__category__slug=category
            ).distinct()
        
        return queryset

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"BrandViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} brands")
            return response
        except Exception as e:
            logger.error(f"Error in BrandViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"BrandViewSet.retrieve called with id: {kwargs.get('pk')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved brand")
            return response
        except Exception as e:
            logger.error(f"Error in BrandViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SizeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Size.objects.all().order_by('name')
    serializer_class = SizeSerializer
    permission_classes = [permissions.AllowAny]

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"SizeViewSet.list called with params: {request.query_params}")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned {len(response.data)} sizes")
            return response
        except Exception as e:
            logger.error(f"Error in SizeViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"SizeViewSet.retrieve called with id: {kwargs.get('pk')}")
            response = super().retrieve(request, *args, **kwargs)
            logger.info(f"Successfully retrieved size")
            return response
        except Exception as e:
            logger.error(f"Error in SizeViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class LandingPageOrderViewSet(viewsets.ModelViewSet):
    """ViewSet for landing page orders"""
    queryset = LandingPageOrder.objects.select_related(
        'product',
        'product__shop',
        'product__brand',
        'user'
    ).order_by('-created_at')
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return LandingPageOrderSerializer
        return LandingPageOrderListSerializer
    
    def get_queryset(self):
        """Filter orders based on user authentication"""
        queryset = super().get_queryset()
        
        # If user is authenticated, they can see their own orders
        if self.request.user and self.request.user.is_authenticated:
            if self.request.user.is_staff or self.request.user.is_superuser:
                # Staff can see all orders
                return queryset
            else:
                # Regular users can only see their own orders
                return queryset.filter(user=self.request.user)
        
        # Unauthenticated users cannot list orders (but can create)
        return queryset.none()
    
    def create(self, request, *args, **kwargs):
        """Create a new landing page order"""
        try:
            logger.info(f"LandingPageOrderViewSet.create called with data: {request.data}")
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            
            logger.info(f"Successfully created landing page order: {serializer.data['order_number']}")
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error in LandingPageOrderViewSet.create: {str(e)}", exc_info=True)
            return Response(
                {"error": str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def list(self, request, *args, **kwargs):
        """List landing page orders"""
        try:
            logger.info(f"LandingPageOrderViewSet.list called")
            response = super().list(request, *args, **kwargs)
            logger.info(f"Successfully returned landing page orders")
            return response
        except Exception as e:
            logger.error(f"Error in LandingPageOrderViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def retrieve(self, request, *args, **kwargs):
        """Retrieve a specific landing page order"""
        try:
            logger.info(f"LandingPageOrderViewSet.retrieve called with id: {kwargs.get('pk')}")
            
            # Check permission for non-staff users
            instance = self.get_object()
            if not (request.user.is_staff or request.user.is_superuser):
                if not request.user.is_authenticated or instance.user != request.user:
                    return Response(
                        {"error": "You do not have permission to view this order."}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            
            serializer = self.get_serializer(instance)
            logger.info(f"Successfully retrieved landing page order: {instance.order_number}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in LandingPageOrderViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def get_serializer_context(self):
        """Add request to serializer context"""
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context
