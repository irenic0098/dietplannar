from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/', include([
        path('auth/', include('accounts.urls')),
        path('food/', include('food.urls')),
        path('plans/', include('plans.urls')),
        path('tracking/', include('tracking.urls')),
        path('community/', include('community.urls')),
        path('calculate/', include('core.urls')),
        path('notifications/', include('notifications.urls')),
        path('reports/', include('reports.urls')),
        path('chat/', include('chat.urls')),
    ])),

    # Legacy routes (backward compat)
    path('api/auth/', include('accounts.urls')),
    path('api/food/', include('food.urls')),
    path('api/plans/', include('plans.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/community/', include('community.urls')),
    path('api/calculate/', include('core.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/chat/', include('chat.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
