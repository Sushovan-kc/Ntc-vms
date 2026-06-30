from django.contrib import admin
from django.urls import path
from .views import RegisterUserView, UserProfileViewSet,UserProfileDetailView,AdminProfileManagementViewSet,UserTableViewset
urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='new-registration'),
    path('userprofileslist/', UserProfileViewSet.as_view({'get': 'list'}), name='user-profiles'),
    path('usertable/', UserTableViewset.as_view({'get': 'list'}), name='user-table'),
    # path('userprofileslist/<int:pk>/',
    #       UserProfileViewSet.as_view({'get': 'retrieve','put': 'update','patch': 'partial_update' }), 
    #       name='user-profile-detail'),
    path('myprofile/', UserProfileDetailView.as_view({'get': 'retrieve','patch': 'partial_update','put': 'update' }), 
         name='user-profile-detail'),
    path('admin/getlist/', AdminProfileManagementViewSet.as_view({'get': 'list'}), name='admin-manage-profiles'),
    path('admin/manageprofiles/<int:pk>/', AdminProfileManagementViewSet.as_view({'get': 'retrieve','put': 'update','patch': 'partial_update','delete': 'destroy',"post": "create"}), name='admin-manage-profiles'),
]
