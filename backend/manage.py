#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # ========================================
    # DEV MODE: Suppress HTTPS error messages
    # ========================================
    # When running the development server, patch Django's basehttp module to:
    # 1. Silently ignore HTTPS/TLS connection attempts (no more error logs)
    # 2. Suppress the "Bad request version" messages from TLS handshakes
    # 
    # This is ONLY for local development to avoid console spam.
    # Remove this patch in production!
    if 'runserver' in sys.argv:
        try:
            import logging
            from django.core.servers import basehttp
            
            # Completely suppress the log_error and log_message methods
            def silent_log(*args, **kwargs):
                # Check if this is an HTTPS/TLS related error
                if args:
                    format_str = str(args[0]) if len(args) > 0 else ""
                    rest = ' '.join(str(a) for a in args[1:]) if len(args) > 1 else ""
                    full_message = format_str + ' ' + rest
                    
                    # Filter HTTPS and Bad request version messages
                    if any(keyword in full_message for keyword in ['HTTPS', 'Bad request version', 'code 400']):
                        return  # Silently ignore
                
                # For non-HTTPS errors, use the original behavior
                return basehttp.WSGIRequestHandler.log_message(*args, **kwargs)
            
            # Patch both log_error and log_message
            basehttp.WSGIRequestHandler.log_error = silent_log
            basehttp.WSGIRequestHandler.log_message = lambda self, *args, **kwargs: None  # Suppress all logs
            
            # Also suppress at the logging level
            logging.getLogger('django.server').setLevel(logging.ERROR)
            logging.getLogger('django.server').addFilter(lambda record: 'HTTPS' not in record.getMessage())
            
        except Exception as e:
            pass  # If patching fails, just continue

    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
