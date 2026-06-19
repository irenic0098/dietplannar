from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('register/', views.register, name='auth-register'),
    path('login/', views.login, name='auth-login'),
    path('logout/', views.logout, name='auth-logout'),
    path('google/', views.google_auth, name='auth-google'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),

    # Profile
    path('profile/', views.profile, name='auth-profile'),
    path('change-password/', views.change_password, name='change-password'),

    # Admin
    path('users/', views.all_users, name='admin-users'),
    path('users/role/', views.update_user_role, name='admin-user-role'),
    path('users/<int:user_id>/', views.user_detail_admin, name='admin-user-detail'),
    path('users/<int:user_id>/toggle-active/', views.toggle_user_active, name='admin-toggle-active'),
    path('audit-logs/', views.audit_logs, name='admin-audit-logs'),
    path('stats/', views.platform_stats, name='admin-stats'),
]
