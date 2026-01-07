from pathlib import Path
import os

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-ix-#dj)eo1vu6l%c**t&cw!53gyyfyic824tueuek(&1l3rj4i'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ["*"]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # Main Domain
    "https://chinakroy.com",
    "https://www.chinakroy.com",
    "http://chinakroy.com",

    # API Domain
    "https://api.chinakroy.com",

    # Vercel App (HTTPS)
    "https://chinakroy.vercel.app", 

    "http://127.0.0.1:8000",
]


AUTH_USER_MODEL = 'users.User'


# Application definition

INSTALLED_APPS = [
    'jazzmin',  # Must be before django.contrib.admin
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'django_otp',
    'django_otp.plugins.otp_totp',

    # 3rd Party Apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',  # For token blacklisting
    'drf_spectacular',  # API Documentation
    'corsheaders',
    'import_export',
    'ckeditor',
    'django_filters',
    'django_extensions',

    # Local Apps
    'users',
    'shops',
    'products',
    'orders',
    'website',  # New website management app
    'sections',  # New sections management app
    'utils',  # Utility functions
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'utils.middleware.SuppressReloadEventsMiddleware',  # Handle reload events
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',

    'django_otp.middleware.OTPMiddleware',


    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}



CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.dummy.DummyCache",
    }
}

# Redis Cache (disabled for now - requires Redis server)
# CACHES = {
#     "default": {
#         "BACKEND": "django_redis.cache.RedisCache",
#         "LOCATION": "redis://127.0.0.1:6379/1",
#         "OPTIONS": {
#             "CLIENT_CLASS": "django_redis.client.DefaultClient",
#         }
#     }
# }




JAZZMIN_SETTINGS = {
    "site_title": "KroyPata Admin",
    "site_header": "KroyPata Administration",
    "site_brand": "KroyPata Ecommerce",
    "site_logo": None,
    "login_logo": None,
    "site_logo_classes": "img-circle",
    "site_icon": None,
    "welcome_sign": "Welcome to KroyPata Admin Dashboard",
    "copyright": "KroyPata Ecommerce Platform",
    "search_model": ["auth.User", "products.Product", "orders.Order"],
    "user_avatar": None,
    
    # Top Menu
    "topmenu_links": [
        {"name": "Home", "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "View Site", "url": "https://chinakroy.com", "new_window": True},
        {"model": "auth.User"},
    ],
    
    # User Menu
    "usermenu_links": [
        {"model": "auth.user"},
    ],
    
    # Side Menu
    "show_sidebar": True,
    "navigation_expanded": True,
    "hide_apps": [],
    "hide_models": [],
    
    # Ordering
    "order_with_respect_to": [
        "auth",
        "users",
        "products",
        "orders",
        "shops",
        "website",
        "sections",
    ],
    
    # Custom icons for apps
    "icons": {
        # Auth & Users
        "auth": "fas fa-users-cog",
        "auth.user": "fas fa-user",
        "auth.Group": "fas fa-users",
        "users.User": "fas fa-user-circle",
        "users.Address": "fas fa-map-marker-alt",
        "users.WholesalerProfile": "fas fa-store",
        "users.AffiliateProfile": "fas fa-handshake",
        
        # Products
        "products": "fas fa-shopping-bag",
        "products.Product": "fas fa-box",
        "products.ProductVariant": "fas fa-boxes",
        "products.Brand": "fas fa-tag",
        "products.Category": "fas fa-th-large",
        "products.SubCategory": "fas fa-th",
        "products.Color": "fas fa-palette",
        "products.Size": "fas fa-ruler",
        "products.Review": "fas fa-star",
        "products.ProductSpecification": "fas fa-list",
        "products.ProductAdditionalImage": "fas fa-images",
        "products.ProductAdditionalDescription": "fas fa-align-left",
        "products.VariantImage": "fas fa-image",
        "products.LandingPageOrder": "fas fa-file-invoice",
        
        # Orders
        "orders": "fas fa-shopping-cart",
        "orders.Order": "fas fa-receipt",
        "orders.OrderItem": "fas fa-list-ul",
        "orders.OrderPayment": "fas fa-credit-card",
        "orders.OrderUpdate": "fas fa-history",
        "orders.ShippingMethod": "fas fa-shipping-fast",
        "orders.ShippingTier": "fas fa-layer-group",
        "orders.ShippingCategory": "fas fa-truck",
        "orders.FreeShippingRule": "fas fa-gift",
        "orders.Coupon": "fas fa-ticket-alt",
        "orders.CashOnDelivery": "fas fa-money-bill-wave",
        "orders.ProductPreOrder": "fas fa-clock",
        
        # Shops
        "shops": "fas fa-store-alt",
        "shops.Shop": "fas fa-store",
        
        # Website
        "website": "fas fa-globe",
        "website.NavbarSettings": "fas fa-bars",
        "website.OfferCategory": "fas fa-tags",
        "website.HeroBanner": "fas fa-image",
        "website.OfferBanner": "fas fa-ad",
        "website.HorizontalPromoBanner": "fas fa-bullhorn",
        "website.BlogPost": "fas fa-blog",
        "website.FooterSection": "fas fa-sitemap",
        "website.FooterLink": "fas fa-link",
        "website.SocialMediaLink": "fas fa-share-alt",
        "website.SiteSettings": "fas fa-cog",
        
        # Sections
        "sections": "fas fa-layer-group",
        "sections.Section": "fas fa-list-alt",
        "sections.SectionItem": "fas fa-puzzle-piece",
        "sections.PageSection": "fas fa-file",
        
        # Utils
        "utils": "fas fa-tools",
    },
    
    # Default icon
    "default_icon_parents": "fas fa-chevron-circle-right",
    "default_icon_children": "fas fa-circle",
    
    # Related modal
    "related_modal_active": False,
    
    # Custom links
    "custom_links": {},
    
    # UI Tweaks
    "show_ui_builder": False,
    "changeform_format": "horizontal_tabs",
    "changeform_format_overrides": {
        "auth.user": "collapsible",
        "auth.group": "vertical_tabs"
    },
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False,
    "footer_small_text": False,
    "body_small_text": False,
    "brand_small_text": False,
    "brand_colour": "navbar-dark",
    "accent": "accent-primary",
    "navbar": "navbar-dark",
    "no_navbar_border": False,
    "navbar_fixed": False,
    "layout_boxed": False,
    "footer_fixed": False,
    "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary",
    "sidebar_nav_small_text": False,
    "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False,
    "sidebar_nav_compact_style": False,
    "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False,
    "theme": "default",
    "dark_mode_theme": None,
    "button_classes": {
        "primary": "btn-primary",
        "secondary": "btn-secondary",
        "info": "btn-info",
        "warning": "btn-warning",
        "danger": "btn-danger",
        "success": "btn-success"
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Dhaka'

USE_I18N = True

USE_TZ = True




STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'mediafiles')



DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CSRF_TRUSTED_ORIGINS = [
    "https://chinakroy.com",
    "https://www.chinakroy.com",
    "https://api.chinakroy.com",
    "https://chinakroy.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:8000",
]

# ==== DEV MODE: CSRF Security Disabled ====
# CSRF_COOKIE_SECURE = True  # Ensures the CSRF cookie is only sent over HTTPS (ENABLE IN PRODUCTION)
# CSRF_COOKIE_HTTPONLY = True  # Prevents JavaScript access to CSRF cookie (ENABLE IN PRODUCTION)



REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',  # API Documentation
}

# DRF Spectacular Settings for API Documentation
SPECTACULAR_SETTINGS = {
    'TITLE': 'ICommerce API',
    'DESCRIPTION': 'Complete API documentation for ICommerce ecommerce platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': r'/api/',
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': True,
        'filter': True,
    },
    'SWAGGER_UI_FAVICON_HREF': None,
    'REDOC_UI_SETTINGS': {
        'hideDownloadButton': False,
    },
}

# Simple JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),  # Shorter for better security
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,

    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,

    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',

    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',

    'JTI_CLAIM': 'jti',

    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=15),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    
    # Additional security settings
    'BLACKLIST_AFTER_ROTATION': True,
    'BLACKLIST_AFTER_LOGOUT': True,
}

# Authentication backends
AUTHENTICATION_BACKENDS = [
    'users.authentication.EmailBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'file'],
            'level': 'ERROR',  # Only log errors, not 404s
            'propagate': False,
        },
        'products': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'sections': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}










# ========================================
# DEV MODE: ALL SECURITY FEATURES DISABLED
# ========================================
# WARNING: Enable these settings in production!
# These are commented out for local development only.

# Cross-site Scripting (XSS) Protection
# SECURE_BROWSER_XSS_FILTER = True  # (ENABLE IN PRODUCTION)
# SECURE_CONTENT_TYPE_NOSNIFF = True  # (ENABLE IN PRODUCTION)

# Trust the X-Forwarded-Proto header for SSL (required for Vercel/Proxies)
# SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')  # (ENABLE IN PRODUCTION)

# SSL Redirect - Forces HTTPS
SECURE_SSL_REDIRECT = False  # DEV MODE: Disabled to allow HTTP requests
# SECURE_SSL_REDIRECT = True  # (ENABLE IN PRODUCTION)

# HTTP Strict Transport Security (HSTS)
# SECURE_HSTS_SECONDS = 86400  # (ENABLE IN PRODUCTION)
# SECURE_HSTS_PRELOAD = True  # (ENABLE IN PRODUCTION)
# SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # (ENABLE IN PRODUCTION)

# Cookie Security
CSRF_COOKIE_SECURE = False  # DEV MODE: Allows cookies over HTTP
SESSION_COOKIE_SECURE = False  # DEV MODE: Allows session cookies over HTTP
# CSRF_COOKIE_SECURE = True  # (ENABLE IN PRODUCTION) - Only send CSRF cookie over HTTPS
# SESSION_COOKIE_SECURE = True  # (ENABLE IN PRODUCTION) - Only send session cookie over HTTPS