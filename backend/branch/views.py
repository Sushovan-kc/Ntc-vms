from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.generics import CreateAPIView
from core.permissions import IsSuperAdmin 
from rest_framework.permissions import IsAuthenticated
from .models import Branch
from .serializers import BranchSerializer, AddBranchSerializer

# Create your views here.

class BranchViewSet(ReadOnlyModelViewSet):
    """
    A simple ViewSet for viewing branches.
    """
    queryset = Branch.objects.all()
    serializer_class = BranchSerializer

class AddBranchViewSet(CreateAPIView):
    """
    A simple ViewSet for adding branches.
    """
    serializer_class = AddBranchSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]

    def create(self, request, *args, **kwargs):
        """
        Overriding create allows us to provide your custom 
        success message while maintaining generic performance.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Automatically throws 400 Bad Request if invalid
        self.perform_create(serializer)
        
        return Response(
            {"message": "Branch added successfully."}, 
            status=201
        )

