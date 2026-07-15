# utils/telemetry_sync.py
from django.conf import settings
from .threads import bg_executor
from driver.models import DispatchRecord
from .distance import calculate_route_distance  # Uses your exact, unchanged utility function

def execute_final_db_sync(booking_id, dispatch_record_id):
    """
    Reads coordinate pings out of Redis, executes your Haversine calculation,
    and updates the historical SQL row exactly once.
    """
    redis_key = f"route:{booking_id}"
    
    # 1. Pull the full list out of Redis memory
    raw_coords = settings.REDIS_CLIENT.lrange(redis_key, 0, -1)
    if not raw_coords:
        return

    # 2. Parse the string list back into numerical [[lat, lon], [lat, lon]]
    route_history = []
    for item in raw_coords:
        try:
            lat_str, lon_str = item.split(',')
            route_history.append([float(lat_str), float(lon_str)])
        except (ValueError, AttributeError):
            continue

    try:
        # 3. Fetch record, compute your distance using your utility, and save
        record = DispatchRecord.objects.get(pk=dispatch_record_id)
        record.route_history = route_history
        
        # Calling your EXACT unchanged utility function here:
        record.distance_traveled_km = calculate_route_distance(route_history)
        
        record.save(update_fields=['route_history', 'distance_traveled_km'])
        
        # 4. Flush Redis to free server memory
        settings.REDIS_CLIENT.delete(redis_key)
    except DispatchRecord.DoesNotExist:
        pass

def trigger_dispatch_finalization(booking_id, dispatch_record_id):
    """
    Call this function from your main view layer when a trip finishes.
    """
    bg_executor.submit(execute_final_db_sync, booking_id, dispatch_record_id)
