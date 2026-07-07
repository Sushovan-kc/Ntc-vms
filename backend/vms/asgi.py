import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import driver.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vms.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            driver.routing.websocket_urlpatterns
        )
    ),
})
