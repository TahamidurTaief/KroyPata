# shops/serializers.py
from rest_framework import serializers
from .models import Shop

class ShopSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True) # The owner is set automatically in the view

    class Meta:
        model = Shop
        fields = ['id', 'name', 'slug', 'owner', 'description', 'is_active']