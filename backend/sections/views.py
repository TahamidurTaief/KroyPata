# sections/views.py
import logging
from django.db.models import Prefetch
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from .models import Section, SectionItem, PageSection
from .serializers import (
    SectionSerializer, SectionListSerializer, SectionCreateSerializer,
    SectionItemSerializer, SectionItemCreateSerializer,
    PageSectionSerializer, PageSectionCreateSerializer,
    PageSectionsSerializer
)

# Set up logging
logger = logging.getLogger(__name__)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing sections
    """
    queryset = Section.objects.all().prefetch_related(
        'items__product__sub_category__category',
        'items__category',
        'page_assignments'
    ).order_by('order', 'name')
    permission_classes = [permissions.AllowAny]  # Adjust based on your needs
    pagination_class = StandardResultsSetPagination
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SectionListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SectionCreateSerializer
        return SectionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by section type
        section_type = self.request.query_params.get('section_type')
        if section_type:
            queryset = queryset.filter(section_type=section_type)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def items(self, request, slug=None):
        """Get all items for a specific section"""
        section = self.get_object()
        items = section.items.select_related('product', 'category').order_by('order')
        serializer = SectionItemSerializer(items, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def pages(self, request, slug=None):
        """Get all page assignments for a specific section"""
        section = self.get_object()
        page_assignments = section.page_assignments.filter(is_active=True).order_by('order')
        serializer = PageSectionSerializer(page_assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_page(self, request):
        """Get all sections for a specific page"""
        page_name = request.query_params.get('page')
        if not page_name:
            return Response(
                {'error': 'page parameter is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        page_sections = PageSection.objects.filter(
            page_name=page_name,
            is_active=True,
            section__is_active=True
        ).select_related('section').prefetch_related(
            Prefetch(
                'section__items',
                queryset=SectionItem.objects.select_related(
                    'product__sub_category__category',
                    'category'
                ).order_by('order')
            )
        ).order_by('order')
        
        serializer = PageSectionsSerializer(page_sections, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available section types"""
        return Response({
            'section_types': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in Section.SECTION_TYPES
            ]
        })


class SectionItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing section items
    """
    queryset = SectionItem.objects.all().select_related(
        'section', 'product__sub_category__category', 'category'
    ).order_by('section__order', 'order')
    serializer_class = SectionItemSerializer
    permission_classes = [permissions.AllowAny]  # Adjust based on your needs
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return SectionItemCreateSerializer
        return SectionItemSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by section
        section_id = self.request.query_params.get('section')
        if section_id:
            queryset = queryset.filter(section__id=section_id)
        
        # Filter by section slug
        section_slug = self.request.query_params.get('section_slug')
        if section_slug:
            queryset = queryset.filter(section__slug=section_slug)
        
        # Filter by item type
        item_type = self.request.query_params.get('item_type')
        if item_type == 'product':
            queryset = queryset.filter(product__isnull=False)
        elif item_type == 'category':
            queryset = queryset.filter(category__isnull=False)
        
        return queryset


class PageSectionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing page section assignments
    """
    queryset = PageSection.objects.all().select_related('section').order_by('page_name', 'order')
    serializer_class = PageSectionSerializer
    permission_classes = [permissions.AllowAny]  # Adjust based on your needs
    pagination_class = StandardResultsSetPagination
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PageSectionCreateSerializer
        return PageSectionSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by page
        page_name = self.request.query_params.get('page')
        if page_name:
            queryset = queryset.filter(page_name=page_name)
        
        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            is_active_bool = is_active.lower() in ['true', '1', 'yes']
            queryset = queryset.filter(is_active=is_active_bool)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def pages(self, request):
        """Get available page choices"""
        return Response({
            'pages': [
                {'value': choice[0], 'label': choice[1]} 
                for choice in PageSection.PAGE_CHOICES
            ]
        })
