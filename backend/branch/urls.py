from django.contrib import admin
from django.urls import path
from .views import AddBranchViewSet
urlpatterns = [
    path('add/', AddBranchViewSet.as_view(), name='add-branch'),
]
