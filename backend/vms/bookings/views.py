from django.shortcuts import render

from .models import Booking
from .serializers import BookingSerializer,BookingApprovalSerializer
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from core.permissions import IsBranchAdmin
from core.filters import BranchFilterBackend
from rest_framework.viewsets import ModelViewSet
# Create your views here.

class NewBookingView(CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        """
        Overriding create allows us to provide your custom 
        success message while maintaining generic performance.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Automatically throws 400 Bad Request if invalid
        self.perform_create(serializer)
        
        return Response(
            {"message": "Booking successful. Awaiting system admin approval."}, 
            status=status.HTTP_201_CREATED
        )
    
class BookingApprovalView(ModelViewSet):
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = BookingApprovalSerializer
    filter_backends = [BranchFilterBackend]
    queryset = Booking.objects.all()
    def partial_update(self, request, *args, **kwargs):
        """
        Overriding partial_update allows us to provide your custom 
        success message while maintaining generic performance.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Automatically throws 400 Bad Request if invalid
        self.perform_update(serializer)
        
        return Response(
            {"message": "Booking approval status updated successfully."}, 
            status=status.HTTP_200_OK
        )
    
class BookingListView(ModelViewSet):
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = BookingSerializer
    filter_backends = [BranchFilterBackend]
    queryset = Booking.objects.all()