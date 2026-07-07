# tasks.py (Inside your current app folder)
from celery import shared_task
from .models import DispatchRecord
from .utils import calculate_route_distance


@shared_task
def log_telemetry_data(booking_id, lat, lon):
    """
    Appends a new GPS coordinate to the running route_history trail 
    for the active DispatchRecord linked to the given booking.
    """
    try:
        # We trace paths by linking directly to the immutable Booking or Vehicle ID
        # since your Dispatches objects delete themselves on complete
        record = DispatchRecord.objects.get(booking_id=booking_id, dispatch_status='IN_PROGRESS')

        current_route = record.route_history or []
        current_route.append([lat, lon])

        record.route_history = current_route
        record.save(update_fields=['route_history'])
    except DispatchRecord.DoesNotExist:
        pass


@shared_task
def compute_and_save_distance(dispatch_record_id):
    """
    Triggered automatically when a dispatch concludes (COMPLETED or CANCELLED).
    Fetches the recorded coordinate trail, runs the pure-Python Haversine calculation,
    and writes the final float value into the distance_traveled_km column.
    """
    try:
        record = DispatchRecord.objects.get(pk=dispatch_record_id)
        route = record.route_history or []

        km = calculate_route_distance(route)
        record.distance_traveled_km = km
        record.save(update_fields=['distance_traveled_km'])
    except DispatchRecord.DoesNotExist:
        # Record may have been deleted externally — silently skip
        pass
