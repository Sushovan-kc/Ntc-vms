from django.contrib import admin
from django.urls import path,include
from .views import AdminDriverProfileManagementViewSet, DriverListViewSet, DriverProfileSetupViewSet,DriverVehicleInfoViewSet,DispatchViewSet,DriverDispatchView,DriverDispatchStatusUpdateView

urlpatterns = [
     path('update/', DriverProfileSetupViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='driver-profile-update'),
    path('admin/<int:pk>/', AdminDriverProfileManagementViewSet.as_view({
        'get': 'list',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    })),
    
    path('vehicleinfo/', DriverVehicleInfoViewSet.as_view({'get':'retrieve'}), name='driver-vehicle-info'),
    path('admindispatchlist/', DispatchViewSet.as_view({'get':'list'}), name='dispatches'),
    path('mydispatchinfo/', DriverDispatchView.as_view({'get':'list'}), name='driver-dispatches'),
    path('dispatch-status-update/<int:pk>/', DriverDispatchStatusUpdateView.as_view({'patch':'partial_update'}), name='driver-dispatch-status-update'),
    path('unassigned-driver-list/',DriverListViewSet.as_view({'get':'list'}),name='unassigned-driver-list'),]