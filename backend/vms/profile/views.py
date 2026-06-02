from django.shortcuts import render
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .serializers import UserRegistrationSerializer
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.views import APIView, Response, status
from .models import Profile
from .serializers import userProfileSerializer
from core.permissions import IsSuperAdmin
from core.filters import BranchFilterBackend
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
# Create your views here.

class RegisterUserView(APIView):
    # Allow any anonymous guest on the frontend to sign up
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Registration successful. Awaiting system admin role approval."}, 
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserProfileViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated,]  
    filter_backends = [BranchFilterBackend]
    queryset = Profile.objects.all()
    serializer_class = userProfileSerializer


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # Authenticate against Django's user database
        user = authenticate(username=username, password=password)

        if user is None:
            # Return error if authentication fails
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        profile = getattr(user, 'profile', None)
        role = getattr(profile, 'role', None)
        is_approved = getattr(profile, 'role_approved', False)
        branch = getattr(profile, 'branch', None)

        # Generate JWT tokens if credentials are correct
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'username': user.username,
            'Role': role,
            'is approved': is_approved,
            'branch': branch.id if branch is not None else None,
            'branch_name': branch.name if branch is not None else None,
        }, status=status.HTTP_200_OK)