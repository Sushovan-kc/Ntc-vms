from django.contrib import admin
from .models import DispatchRecord, Dispatches, DriverProfile
# Register your models here.


class DriverProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'license_number', 'driver_status', 'branch')
    search_fields = ('user__user__username', 'license_number')
    list_filter = ['driver_status', 'branch']

admin.site.register(DriverProfile, DriverProfileAdmin)

class DispatchesAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'vehicle', 'booking')
    search_fields = ('driver__user__user__username', 'vehicle__license_plate', 'booking__id')
    list_filter = ['driver', 'vehicle']

admin.site.register(Dispatches, DispatchesAdmin)


class DispatchRecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'driver', 'vehicle', 'booking', 'dispatch_status')
    search_fields = ('driver__user__user__username', 'vehicle__license_plate', 'booking__id')
    list_filter = ['dispatch_status', 'driver', 'vehicle']


admin.site.register(DispatchRecord, DispatchRecordAdmin)