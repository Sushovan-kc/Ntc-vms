from django.contrib import admin
from django.urls import path
from .views import RegisterUserView, ResetPasswordConfirmView, UserProfileViewSet,UserProfileDetailView,AdminProfileManagementViewSet,UserTableViewset,ForgotPasswordView
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
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password-confirm/<str:uidb64>/<str:token>/', ResetPasswordConfirmView.as_view(), name='reset_password_confirm'),
]
