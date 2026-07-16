from django.shortcuts import render
from django.contrib.auth.models import  User
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from .serializers import ForgotPasswordSerializer, UserProfileDetailSerializer, UserRegistrationSerializer, UserTableSerializer, userProfileSerializer, ResetPasswordConfirmSerializer
from rest_framework.permissions import AllowAny, IsAdminUser,IsAuthenticated
from rest_framework.views import APIView, Response, status
from .models import Profile
from core.permissions import IsSuperAdmin,IsBranchAdmin
from core.filters import BranchFilterBackend
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import NotFound
from .adminserializer import AdminUserProfileManagementSerializer 
from rest_framework.pagination import PageNumberPagination
from rest_framework.generics import CreateAPIView,GenericAPIView
from core.pagination import AdminProfileTablePagination
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
# Create your views here.

class RegisterUserView(CreateAPIView):
    """API view to handle user registration requests."""
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        """
        Overriding create allows us to provide your custom 
        success message while maintaining generic performance.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True) # Automatically throws 400 Bad Request if invalid
        self.perform_create(serializer)
        
        return Response(
            {"message": "Registration successful. Awaiting system admin role approval."}, 
            status=status.HTTP_201_CREATED
        )
    
class UserProfileViewSet(ModelViewSet):
    """API viewset to handle user profile operations."""
    permission_classes = [IsAuthenticated,]  
    filter_backends = [BranchFilterBackend]
    queryset = Profile.objects.all()
    serializer_class = userProfileSerializer


class LoginView(APIView):
    """API view to handle user login requests."""
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
            "user_id": user.id,
            'username': user.username,
            'Role': role,
            'is_approved': is_approved,
            'branch': branch.id if branch is not None else None,
            'branch_name': branch.name if branch is not None else None,
        }, status=status.HTTP_200_OK)
    

class UserProfileDetailView(ModelViewSet):
    """API view to retrieve the authenticated user's profile details."""
    permission_classes = [IsAuthenticated]
    queryset = Profile.objects.all()
    serializer_class = UserProfileDetailSerializer

    # def get(self, request):
    #     profile = getattr(request.user, 'profile', None)
    #     if profile is None:
    #         return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    #     serializer = userProfileSerializer(profile)
    #     return Response(serializer.data, status=status.HTTP_200_OK)
    def get_object(self):
        # Fetch the profile linked to the logged-in user
        profile = getattr(self.request.user, 'profile', None)
        
        # If the user profile record does not exist in the DB, raise a clean 404
        if profile is None:
            raise NotFound(detail="Profile not found for this user account.")
            
        return profile
    



class AdminProfileManagementViewSet(ModelViewSet):
    """Admin-only viewset to view, update, list, and delete any user profile."""
    permission_classes = [IsBranchAdmin] # Strictly restricts to staff/admins
    queryset = Profile.objects.all().select_related('user', 'approved_by__user')
    filter_backends = [BranchFilterBackend]
    serializer_class = AdminUserProfileManagementSerializer
    pagination_class = AdminProfileTablePagination

    queryset = Profile.objects.all().select_related('user', 'approved_by__user')

    def update(self, request, *args, **kwargs):
        # Override update to pass the request
        kwargs['partial'] = True  # Allow partial updates
        return super().update(request, *args, **kwargs)
    



class  UserTableViewset(ReadOnlyModelViewSet):
    """Admin-only viewset to list all user profiles which do not have a profile table."""
    permission_classes = [IsAuthenticated, IsBranchAdmin]
    serializer_class = UserTableSerializer
    pagination_class = AdminProfileTablePagination

    def get_queryset(self):

        return User.objects.filter(profile__isnull=True)
    



class ForgotPasswordView(GenericAPIView):
    serializer_class = ForgotPasswordSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            # Security Best Practice: Don't reveal if a user exists or not
            return Response({"success": "If the account exists, a reset link has been sent."}, status=status.HTTP_200_OK)

        if not user.email:
            return Response({"error": "This user does not have an email linked to their account."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate unique temporary tokens
        token = default_token_generator.make_token(user)
        uidb64 = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build dynamic link pointing to your React app routing
        reset_link = f"{settings.FRONTEND_URL}/reset-password/{uidb64}/{token}/"
        
        # Context data context to pass to the HTML template
        context = {
            'username': user.username,
            'reset_link': reset_link
        }
        
        # Render the HTML template with context data
        html_message = render_to_string('emails/password_reset_email.html', context)
        # Create a plain-text version fallback automatically
        plain_message = strip_tags(html_message) 
        
        subject = "Password Reset Request"
        
        send_mail(
            subject=subject,
            message=plain_message,  # Plain text fallback
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,  # The HTML email content
            fail_silently=False
        )
        
        return Response({"success": "Password reset link sent to your registered email."}, status=status.HTTP_200_OK)


class ResetPasswordConfirmView(GenericAPIView):
    serializer_class = ResetPasswordConfirmSerializer
    authentication_classes = [] 
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid dynamic link structure."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "This link is invalid or has expired."}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(serializer.validated_data['password'])
        user.save()
        return Response({"success": "Your password has been successfully updated."}, status=status.HTTP_200_OK)