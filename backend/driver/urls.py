from django.contrib import admin
from django.urls import path,include
from .views import (
    AdminDriverProfileManagementViewSet, DriverListViewSet,
    DriverProfileSetupViewSet, DriverVehicleInfoViewSet,
    DispatchViewSet, DriverDispatchView, DriverDispatchStatusUpdateView,
    DriverDispatchHistoryViewSet, DriverTelemetryIngestView,
    FetchRouteHistoryView, DriverAssetTelemetryUpdateView,
    HistoricalDispatchRouteView,
)

urlpatterns = [
    path('update/', DriverProfileSetupViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update'
    }), name='driver-profile-update'),
    path('admin/<int:pk>/', AdminDriverProfileManagementViewSet.as_view({
        'get':'retrive',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    })),
    path('admin/getlist', AdminDriverProfileManagementViewSet.as_view({
        'get': 'list',
    })),

    path('vehicleinfo/', DriverVehicleInfoViewSet.as_view({'get':'retrieve'}), name='driver-vehicle-info'),
    path('admindispatchlist/', DispatchViewSet.as_view({'get':'list'}), name='dispatches'),
    path('dispatchrecordlist/', DriverDispatchHistoryViewSet.as_view({'get':'list'}), name='dispatch-records'),
    path('mydispatchinfo/', DriverDispatchView.as_view({'get':'list'}), name='driver-dispatches'),
    path('dispatch-status-update/<int:pk>/', DriverDispatchStatusUpdateView.as_view({'patch':'partial_update'}), name='driver-dispatch-status-update'),
    path('unassigned-driver-list/', DriverListViewSet.as_view({'get':'list'}), name='unassigned-driver-list'),

    # GPS ingest — live telemetry from driver device
    path('tracking/ingest/', DriverTelemetryIngestView.as_view(), name='driver_telemetry_ingest'),

    # Live tracking history for active dispatch (used by LiveTrackingMap)
    path('tracking/history/<int:dispatch_id>/', FetchRouteHistoryView.as_view(), name='fetch_dispatch_history'),

    # Feature 1: Driver submits operational telemetry updates for their assigned vehicle
    path('vehicle/telemetry/update/', DriverAssetTelemetryUpdateView.as_view(), name='driver-asset-telemetry-update'),

    # Feature 2: Manager views completed route history by DispatchRecord primary key
    path('tracking/history/record/<int:record_id>/', HistoricalDispatchRouteView.as_view(), name='historical-dispatch-route'),
]