from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/food/', include('food.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/community/', include('community.urls')),
    path('api/calculate/', include('core.urls')),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
