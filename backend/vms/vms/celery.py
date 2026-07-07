# vms/celery.py
import os
from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vms.settings')

app = Celery('vms')

# Read config from Django settings file using the CELERY_ namespace.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Automatically discover tasks.py files inside your installed apps.
app.autodiscover_tasks()
