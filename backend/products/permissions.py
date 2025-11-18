# products/permissions.py
from rest_framework import permissions

class IsShopOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a shop to edit products within it.
    """
    def has_permission(self, request, view):
        # Allow read permissions for any request (including anonymous users)
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write permissions require authentication
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the shop.
        return obj.shop.owner == request.user