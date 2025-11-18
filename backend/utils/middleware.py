# utils/middleware.py
import logging
from django.http import HttpResponse
from django.urls import resolve, Resolver404

logger = logging.getLogger(__name__)

class SuppressReloadEventsMiddleware:
    """
    Middleware to suppress /__reload__/events/ 404 errors during development
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Handle /__reload__/events/ requests silently
        if request.path == '/__reload__/events/':
            # Return empty response for reload events to prevent 404 logging
            return HttpResponse(status=204)  # No Content
        
        response = self.get_response(request)
        return response

class CustomNotFoundMiddleware:
    """
    Middleware to suppress specific 404 error logging
    """
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        response = self.get_response(request)
        return response
    
    def process_exception(self, request, exception):
        # Suppress logging for specific paths that cause noise
        if isinstance(exception, Resolver404):
            suppressed_paths = [
                '/__reload__/',
                '/favicon.ico',
                '/robots.txt'
            ]
            
            if any(request.path.startswith(path) for path in suppressed_paths):
                # Don't log these 404s
                return None
        
        return None
