from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.views import APIView
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import DispatchRecord, Dispatches, DriverProfile
from .serializers import DispatchSerializers, DriverDispatchHistorySerializer, DriverDispatchStatusUpdateSerializer, DriverListSerializer, DriverProfileFirstTimeSetupSerializer
from rest_framework import mixins, viewsets
from rest_framework.exceptions import NotFound
from core.permissions import IsBranchAdmin,IsDriver
from core.filters import BranchFilterBackend, DispatchBranchFilterBackend
from core.pagination import AdminProfileTablePagination
from fleet.models import Vehicle, VehicleInfo
from .serializers import AdminDriverProfileManagementSerializer, DriverVehicleInfoSerializer
from django.core.cache import cache
from django.conf import settings
from django.core.exceptions import PermissionDenied

# Create your views here.

class DriverProfileSetupViewSet(mixins.RetrieveModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DriverProfileFirstTimeSetupSerializer
    queryset = DriverProfile.objects.all()

    def get_object(self):
        user = self.request.user
        
        # 1. Check custom profile relation
        if not hasattr(user, 'profile'):
            raise NotFound({"detail": "Base profile registration record not found."})
        
        # 2. Check driver profile relation
        base_profile = user.profile
        if not hasattr(base_profile, 'driver_profile'):
            raise PermissionDenied({
                "detail": "Driver account entry missing or admin authorization is pending."
            })
            
        return base_profile.driver_profile
    
class AdminDriverProfileManagementViewSet(ModelViewSet):
    """Admin-only viewset to view, update, list, and delete any driver profile."""
    permission_classes = [IsBranchAdmin]  # Strictly restricts to staff/admins
    filter_backends = [BranchFilterBackend]
    serializer_class = AdminDriverProfileManagementSerializer
    pagination_class = AdminProfileTablePagination

    # Optimizes DB hits by hopping from DriverProfile -> Profile -> User in a single SQL query
    queryset = DriverProfile.objects.all().select_related('user__user', 'branch')

    def update(self, request, *args, **kwargs):
        # Override update to pass the request
        kwargs['partial'] = True  # Allow partial updates (PATCH behavior on PUT)
        return super().update(request, *args, **kwargs)
    

class DriverVehicleInfoViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated, IsDriver]
    serializer_class = DriverVehicleInfoSerializer

    def get_queryset(self):
        """
        Filters the vehicles to only return the one assigned 
        to the currently authenticated driver.
        """
        # Assumes your DriverProfile model has a OneToOne relationship with Django's User model
        return Vehicle.objects.filter(current_driver__id=self.request.user.profile.driver_profile.id)

    def retrieve(self, request, *args, **kwargs):
        """
        Intercepts requests matching /vehicleinfo/<id>/ 
        and always returns the logged-in driver's actual vehicle.
        """
        vehicle = self.get_queryset().first()
        
        if not vehicle:
            return Response(
                {"detail": "No vehicle assigned to your profile."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(vehicle)
        return Response(serializer.data)
    
class DispatchViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = DispatchSerializers
    queryset = Dispatches.objects.all().select_related('driver__user__user', 'vehicle', 'booking__user')

class DriverDispatchView(ModelViewSet):
    permission_classes = [IsAuthenticated, IsDriver]
    serializer_class = DispatchSerializers

    def get_queryset(self):
        """
        Filters dispatches to only those assigned to the currently authenticated driver.
        """
        if not Dispatches.objects.filter(driver__id=self.request.user.profile.driver_profile.id).exists():
            
            return Dispatches.objects.none() 
        else:
            return Dispatches.objects.filter(driver__id=self.request.user.profile.driver_profile.id).select_related('driver__user__user', 'vehicle', 'booking__user')
        

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        if not queryset.exists():
            return Response(
                {"detail": "No dispatches found for your profile."}, 
                status=status.HTTP_404_NOT_FOUND
            )
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    

class DriverDispatchStatusUpdateView(ModelViewSet):
    permission_classes = [IsAuthenticated, IsDriver]
    serializer_class = DriverDispatchStatusUpdateSerializer

    def get_queryset(self):
        """
        Filters dispatches to only those assigned to the currently authenticated driver.
        """
        return Dispatches.objects.filter(driver__id=self.request.user.profile.driver_profile.id)

    def update(self, request, *args, **kwargs):
        """
        Allows drivers to update the status of their assigned dispatches.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        # Only allow status updates
        if 'dispatch_status' not in request.data:
            return Response(
                {"detail": "Only 'dispatch_status' can be updated."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


class DriverListViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = DriverListSerializer
    filter_backends = [BranchFilterBackend]
    pagination_class = AdminProfileTablePagination
    queryset = DriverProfile.objects.all().select_related('user__user', 'branch')

    def list(self, request, *args, **kwargs):
        # 1. Standard filtering for the main list
        driver_queryset = self.filter_queryset(self.get_queryset())
        
        # 2. FIXED: Changed 'vehicle__isnull' to 'AssignedVehicle__isnull'
        base_unassigned = DriverProfile.objects.filter(
            AssignedVehicle__isnull=True,
            driver_status=DriverProfile.DriverStatusChoices.AVAILABLE
        ).select_related('user__user', 'branch')
        
        # 3. Apply the branch filter to the unassigned drivers list
        filtered_unassigned = self.filter_queryset(base_unassigned)
        
        # 4. Serialize unassigned drivers using your serializer class
        unassigned_serializer = self.get_serializer(filtered_unassigned, many=True)

        # 5. Maintain table pagination
        page = self.paginate_queryset(driver_queryset)
        if page is not None:
            main_serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(main_serializer.data)
            
            # Inject unassigned drivers cleanly into the paginated response object
            paginated_response.data['unassigned_drivers'] = unassigned_serializer.data
            return paginated_response

        # 6. Fallback response structure
        main_serializer = self.get_serializer(driver_queryset, many=True)
        return Response({
            "drivers": main_serializer.data,
            "unassigned_drivers": unassigned_serializer.data
        }, status=status.HTTP_200_OK)



# driver/views.py

class DriverDispatchHistoryViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DriverDispatchHistorySerializer
    filter_backends = [DispatchBranchFilterBackend]

    def get_queryset(self):
        """
        Managers see all history records. 
        Drivers see only their own completed history records.
        """
        user = self.request.user
        
        # FIX: Point this directly to DispatchRecord, not Dispatches!
        queryset = DispatchRecord.objects.select_related(
            'driver__user__user', 
            'vehicle', 
            'booking__user'
        )

        # 1. Check if the user is a Manager or Admin
        is_manager_or_admin = (
            hasattr(user, 'profile') and 
            user.profile.role in ['super admin', 'admin', 'employee']
        )

        if is_manager_or_admin:
            return queryset

        # 2. If they are a Driver, safely filter by their DriverProfile ID
        if hasattr(user, 'profile') and hasattr(user.profile, 'driver_profile'):
            return queryset.filter(driver__id=user.profile.driver_profile.id)

        # 3. Fallback
        return DispatchRecord.objects.none()




class DriverTelemetryIngestView(APIView):
    def post(self, request):
        # Extract fields from the driver app's background GPS payload
        driver_id = request.data.get('driver_id') 
        try:
            lat = float(request.data.get('latitude'))
            lon = float(request.data.get('longitude'))
        except (TypeError, ValueError):
            return Response({"detail": "Invalid coordinates provided."}, status=400)

        # 1. Zero-DB-Hit Check: Verify if this driver is actively en-route
        trip_info = cache.get(f"active_driver_trip:{driver_id}")
        if not trip_info:
            return Response({"status": "ignored", "message": "No active trip for this driver"}, status=200)

        dispatch_id = trip_info['dispatch_id']
        booking_id = trip_info['booking_id']

        # 2. Push directly to WebSockets room so dispatchers can watch this journey live
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"dispatch_{dispatch_id}",
            {"type": "broadcast_location", "data": {"lat": lat, "lon": lon, "driver_id": driver_id}}
        )

        # 3. REPLACEMENT: Append coordinates straight to Redis list storage (No Celery required)
        redis_key = f"route:{booking_id}"
        try:
            settings.REDIS_CLIENT.rpush(redis_key, f"{lat},{lon}")
            settings.REDIS_CLIENT.expire(redis_key, 172800)  # Auto-expires in 48 hours if trip hangs abandoned
        except Exception as exc:
            # Fallback block to prevent app crash if Redis connection experiences transient drop
            return Response({"status": "error", "message": f"Cache sync failure: {str(exc)}"}, status=500)
        
        return Response({"status": "processed"}, status=202)
    



class FetchRouteHistoryView(APIView):
    def get(self, request, dispatch_id):
        try:
            # 1. Look up the active Dispatch row to grab its immutable booking relation
            dispatch = Dispatches.objects.get(id=dispatch_id)
            booking_id = dispatch.booking_id
            
            # 2. REPLACEMENT: Pull directly from Redis memory cache for real-time React mapping
            redis_key = f"route:{booking_id}"
            raw_coords = settings.REDIS_CLIENT.lrange(redis_key, 0, -1)
            
            coordinates = []
            for item in raw_coords:
                try:
                    lat_str, lon_str = item.split(',')
                    coordinates.append([float(lat_str), float(lon_str)])
                except (ValueError, AttributeError):
                    continue
                    
            return Response({"coordinates": coordinates}, status=200)
            
        except Dispatches.DoesNotExist:
            # Fallback: If the active trip was already completed or deleted from Dispatches,
            # retrieve the static, compiled historical array out of the SQL archive
            try:
                record = DispatchRecord.objects.get(id=dispatch_id)
                return Response({"coordinates": record.route_history or []}, status=200)
            except DispatchRecord.DoesNotExist:
                return Response({"coordinates": []}, status=200)


class DriverAssetTelemetryUpdateView(APIView):
    """
    PATCH endpoint allowing the authenticated driver to submit operational
    telemetry updates (e.g. odometer reading, fuel level) onto their
    currently assigned vehicle's VehicleInfo record.

    Accepted PATCH fields (all optional):
        - kilometers_driven (int)  : current odometer reading
        - mileage           (int)  : fuel efficiency reading
        - last_fuel_date    (date) : ISO date of last refuel  e.g. "2026-07-06"
        - last_service_date (date) : ISO date of last service e.g. "2026-07-06"
    """
    permission_classes = [IsAuthenticated, IsDriver]

    ALLOWED_FIELDS = {'kilometers_driven', 'mileage', 'last_fuel_date', 'last_service_date'}

    def patch(self, request):
        # 1. Walk the relationship chain to find the driver's assigned vehicle
        try:
            driver_profile = request.user.profile.driver_profile
        except AttributeError:
            return Response(
                {"detail": "Driver profile not found for your account."},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            vehicle_info = driver_profile.AssignedVehicle.info
        except (AttributeError, VehicleInfo.DoesNotExist):
            return Response(
                {"detail": "No vehicle or vehicle info record is currently assigned to your profile."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Filter the incoming payload to only the permitted telemetry fields
        update_data = {
            key: value
            for key, value in request.data.items()
            if key in self.ALLOWED_FIELDS
        }

        if not update_data:
            return Response(
                {"detail": f"No valid telemetry fields provided. Accepted fields: {', '.join(sorted(self.ALLOWED_FIELDS))}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Apply and persist updates
        for field, value in update_data.items():
            setattr(vehicle_info, field, value)

        try:
            vehicle_info.save(update_fields=list(update_data.keys()))
        except Exception as exc:
            return Response(
                {"detail": f"Failed to save telemetry data: {str(exc)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {
                "status": "updated",
                "message": "Vehicle telemetry metrics saved successfully.",
                "updated_fields": update_data,
            },
            status=status.HTTP_200_OK
        )


class HistoricalDispatchRouteView(APIView):
    """
    GET endpoint for managers/admins to retrieve the GPS coordinate trail
    stored inside a completed or cancelled DispatchRecord's route_history field.

    Accepts:
        record_id (int): Primary key of the DispatchRecord to fetch.

    Returns:
        coordinates   : [[lat, lon], ...] array
        total_points  : integer count of logged waypoints
        distance_km   : computed total distance in km
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, record_id):
        try:
            record = DispatchRecord.objects.select_related('driver', 'vehicle', 'booking').get(pk=record_id)
        except DispatchRecord.DoesNotExist:
            return Response(
                {"detail": f"No dispatch record found with ID {record_id}."},
                status=status.HTTP_404_NOT_FOUND
            )

        coordinates = record.route_history or []
        return Response(
            {
                "record_id": record.pk,
                "dispatch_status": record.dispatch_status,
                "coordinates": coordinates,
                "total_points": len(coordinates),
                "distance_km": record.distance_traveled_km,
            },
            status=status.HTTP_200_OK
        )
