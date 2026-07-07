from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import CreateAPIView, RetrieveUpdateAPIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from core.filters import BranchFilterBackend
from core.permissions import IsBranchAdmin
from .serializers import VehicleSerializer, AssignDriverSerializer
from .models import Vehicle
from django.db import transaction

# Create your views here.
class Addnewvehicle(CreateAPIView):
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = VehicleSerializer
    queryset = Vehicle.objects.all()

    def perform_create(self, serializer):
        """
        Intercepts creation step to attach the admin's branch context securely.
        """
        serializer.save(branch=self.request.user.profile.branch)

    def create(self, request, *args, **kwargs):
        """
        Overrides to return your custom success text message payload.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Automatically returns 400 JSON on error
        self.perform_create(serializer)
        
        return Response(
            {"message": "Vehicle added successfully."}, 
            status=status.HTTP_201_CREATED
        )


class VehicleListView(ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    
    # 2. Add your branch filter class to the filter_backends list
    filter_backends = [BranchFilterBackend]

    def list(self, request, *args, **kwargs):
        # 3. This line automatically calls your BranchFilterBackend.filter_queryset()
        queryset = self.filter_queryset(self.get_queryset())
        
        # 4. Handle pagination safely
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # 5. Serialize and return the filtered vehicles
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class VehicleAssignView(RetrieveUpdateAPIView):
    # Optimized using select_related for current_driver to keep it fast
    queryset = Vehicle.objects.select_related('current_driver').all()
    serializer_class = AssignDriverSerializer
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    filter_backends = [BranchFilterBackend]

    def perform_update(self, serializer):
        # 1. Get the new driver object from the validated data
        # 'current_driver' should match the field name in your AssignDriverSerializer
        new_driver = serializer.validated_data.get('current_driver')
        
        # 2. Get the current vehicle being updated
        target_vehicle = self.get_object()

        # If a new driver is being assigned, wrap the operation in an atomic transaction
        if new_driver:
            with transaction.atomic():
                # 3. Find if this driver is currently assigned to ANY OTHER vehicle
                # We exclude the target_vehicle so we don't clear it if assigning the same driver
                existing_vehicle = Vehicle.objects.filter(current_driver=new_driver).exclude(id=target_vehicle.id).first()
                
                if existing_vehicle:
                    # 4. BREAK the old relationship to avoid database unique constraint errors
                    existing_vehicle.current_driver = None
                    existing_vehicle.save()

                # 5. Let the serializer finish saving the driver onto the new vehicle
                serializer.save()
        else:
            # If the admin chose 'None' (unassigning a driver), save normally
            serializer.save()

    
