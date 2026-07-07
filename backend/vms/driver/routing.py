# driver/routing.py
from django.urls import re_path
from .consumers import TrackingConsumer

websocket_urlpatterns = [
    # Listens to string paths formatted as: ws://127.0.0.1:8000/ws/tracking/<dispatch_id>/
    re_path(r'^ws/tracking/(?P<dispatch_id>\d+)/$', TrackingConsumer.as_asgi()),
]
