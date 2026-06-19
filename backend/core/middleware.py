"""
Audit logging middleware — records every API request for security & compliance.
Skips static files, health checks, and configurable paths.
"""
import logging
import time
from django.conf import settings

logger = logging.getLogger('dietplanner')


class AuditLogMiddleware:
    """Log all API requests that modify data or access sensitive endpoints."""

    SKIP_METHODS = {'OPTIONS', 'HEAD'}
    SAFE_METHODS = {'GET'}

    def __init__(self, get_response):
        self.get_response = get_response
        self.enabled = getattr(settings, 'AUDIT_LOG_ENABLED', True)
        self.exclude_paths = getattr(settings, 'AUDIT_LOG_EXCLUDE_PATHS', [])

    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start_time) * 1000)

        if self.enabled and self._should_log(request):
            self._record(request, response, duration_ms)

        return response

    def _should_log(self, request) -> bool:
        if request.method in self.SKIP_METHODS:
            return False
        for path in self.exclude_paths:
            if request.path.startswith(path):
                return False
        # Only log API paths
        return request.path.startswith('/api/')

    def _record(self, request, response, duration_ms: int):
        try:
            # Only write DB audit records for non-GET sensitive actions
            if (request.method not in self.SAFE_METHODS and
                    hasattr(request, 'user') and
                    request.user.is_authenticated):
                from accounts.models import AuditLog
                from accounts.services import AuditService
                AuditLog.objects.create(
                    user=request.user,
                    action='admin_action' if request.user.role in ['admin', 'super_admin'] else 'profile_update',
                    ip_address=AuditService._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500],
                    endpoint=request.path,
                    method=request.method,
                    status_code=response.status_code,
                )
            else:
                # Just log to file for GET requests
                logger.debug(
                    f'{request.method} {request.path} -> {response.status_code} [{duration_ms}ms] '
                    f'user={getattr(request.user, "email", "anon")}'
                )
        except Exception as e:
            logger.warning(f'AuditLogMiddleware error: {e}')
