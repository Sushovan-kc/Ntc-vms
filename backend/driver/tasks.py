# tasks.py (Cleaned up, no Celery)
from django.conf import settings
from .models import DispatchRecord
from .utils import calculate_route_distance

def cache_telemetry_in_redis(booking_id, lat, lon):
    """Replaces your old log_telemetry_data task"""
    redis_key = f"route:{booking_id}"
    # Pushes string to Redis List instantly
    settings.REDIS_CLIENT.rpush(redis_key, f"{lat},{lon}")
    settings.REDIS_CLIENT.expire(redis_key, 86400) # 24hr auto-cleanup

def sync_redis_to_db(booking_id, dispatch_record_id):
    """Replaces your old compute_and_save_distance task"""
    redis_key = f"route:{booking_id}"
    raw_coords = settings.REDIS_CLIENT.lrange(redis_key, 0, -1)
    
    route_history = []
    for item in raw_coords:
        try:
            lat_str, lon_str = item.split(',')
            route_history.append([float(lat_str), float(lon_str)])
        except ValueError:
            continue

    try:
        record = DispatchRecord.objects.get(pk=dispatch_record_id)
        record.route_history = route_history
        record.distance_traveled_km = calculate_route_distance(route_history)
        record.save(update_fields=['route_history', 'distance_traveled_km'])
        settings.REDIS_CLIENT.delete(redis_key) # Free Redis memory
    except DispatchRecord.DoesNotExist:
        pass
