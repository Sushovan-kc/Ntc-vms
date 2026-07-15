import math

def calculate_route_distance(route_coordinates):
    """
    Calculates the total distance traveled based on an array of GPS coordinates
    using the Haversine formula, avoiding the need for heavy geospatial libraries.
    
    Args:
        route_coordinates: List of lists/tuples, where each element is [latitude, longitude].
                           Example: [[lat1, lon1], [lat2, lon2], ...]
                           
    Returns:
        float: Total distance in kilometers.
    """
    def haversine(lat1, lon1, lat2, lon2):
        # Earth radius in kilometers
        R = 6371.0 
        
        # Convert latitude and longitude from degrees to radians
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = math.sin(delta_phi / 2.0)**2 + \
            math.cos(phi1) * math.cos(phi2) * \
            math.sin(delta_lambda / 2.0)**2
            
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    if not route_coordinates or len(route_coordinates) < 2:
        return 0.0

    total_distance = 0.0
    for i in range(len(route_coordinates) - 1):
        point1 = route_coordinates[i]
        point2 = route_coordinates[i + 1]
        
        try:
            # Depending on format: [lat, lon]
            lat1, lon1 = float(point1[0]), float(point1[1])
            lat2, lon2 = float(point2[0]), float(point2[1])
            
            distance = haversine(lat1, lon1, lat2, lon2)
            total_distance += distance
        except (ValueError, TypeError, IndexError):
            # Skip malformed coordinate entries gracefully
            continue
            
    return round(total_distance, 2)
