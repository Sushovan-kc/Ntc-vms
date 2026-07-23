import os
from django.core.asgi import get_asgi_application

# Set the default settings module for the 'vms' project
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vms.settings')

# This handles standard HTTP and async requests without Channels overhead
application = get_asgi_application()
