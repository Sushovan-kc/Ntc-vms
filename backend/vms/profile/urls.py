from django.contrib import admin
from django.urls import path
from .views import RegisterUserView, UserProfileViewSet
urlpatterns = [
    path('newregistration', RegisterUserView.as_view(), name='new-registration'),
    path('userprofileslist/', UserProfileViewSet.as_view({'get': 'list'}), name='user-profiles'),
    path('userprofileslist/<int:pk>/',
          UserProfileViewSet.as_view({'get': 'retrieve','put': 'update','patch': 'partial_update' }), 
          name='user-profile-detail'),
]
