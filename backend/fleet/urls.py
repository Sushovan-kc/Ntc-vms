from django.contrib import admin
from django.urls import path,include
from .views import Addnewvehicle, VehicleInfoUpdateView, VehicleInfoView, VehicleListView,VehicleAssignView

urlpatterns = [
    path('add/', Addnewvehicle.as_view(), name='add-vehicle'),
    path('list/', VehicleListView.as_view({'get': 'list'}), name='vehicle-list'),
    path('list/<int:pk>/', VehicleListView.as_view({'get': 'retrieve', 'patch': 'partial_update', 'put': 'update'}), name='vehicle-list'),
    path('assign/<int:pk>/', VehicleAssignView.as_view(), name='vehicle-assign'),
    path('infoupdate/<int:vehicle_id>/', VehicleInfoUpdateView.as_view({"get": "retrieve",'put': 'update','patch': 'partial_update'}), name='vehicle-info-update'),
    path('info/', VehicleInfoView.as_view({"get": "list"}), name='vehicle-info-list'),
   
]
