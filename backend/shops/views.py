import logging
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Shop
from .serializers import ShopSerializer
from users.permissions import IsSellerOrAdmin

# Set up logging
logger = logging.getLogger(__name__)

class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()   
    serializer_class = ShopSerializer
    lookup_field = 'slug'

    def get_permissions(self):
        """
        Override to apply different permissions based on the action.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Write operations require seller or admin permissions
            self.permission_classes = [IsSellerOrAdmin]
        else:
            # Read operations are public
            self.permission_classes = [permissions.AllowAny]
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        """Override list method to add proper error handling and logging."""
        try:
            logger.info(f"ShopViewSet.list called with params: {request.query_params}")
            queryset = self.filter_queryset(self.get_queryset())
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                logger.info(f"Successfully paginated {len(page)} shops")
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            logger.info(f"Successfully returned {len(queryset)} shops")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ShopViewSet.list: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """Override retrieve method to add proper error handling and logging."""
        try:
            logger.info(f"ShopViewSet.retrieve called with slug: {kwargs.get('slug')}")
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            logger.info(f"Successfully retrieved shop: {instance.name}")
            return Response(serializer.data)
        except Exception as e:
            logger.error(f"Error in ShopViewSet.retrieve: {str(e)}", exc_info=True)
            return Response(
                {"error": f"Internal server error: {str(e)}"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)