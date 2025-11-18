# sections/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SectionViewSet, SectionItemViewSet, PageSectionViewSet

# Create router for ViewSets
router = DefaultRouter()
router.register(r'sections', SectionViewSet, basename='section')
router.register(r'section-items', SectionItemViewSet, basename='sectionitem')
router.register(r'page-sections', PageSectionViewSet, basename='pagesection')

app_name = 'sections'

urlpatterns = [
    # Section-related API endpoints
    path('', include(router.urls)),
]
