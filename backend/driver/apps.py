from django.apps import AppConfig


class DriverConfig(AppConfig):
    name = 'driver'

    def ready(self):
      import driver.signals  # Import signals to ensure they are registered