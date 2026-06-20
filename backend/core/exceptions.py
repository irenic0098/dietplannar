"""Custom DRF exception handler for consistent error responses."""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('dietplanner')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'success': False,
            'status_code': response.status_code,
            'errors': response.data,
        }
        # Flatten common patterns
        if isinstance(response.data, dict) and 'detail' in response.data:
            error_data['message'] = str(response.data['detail'])
        elif isinstance(response.data, list):
            error_data['message'] = ' '.join(str(e) for e in response.data)
        else:
            error_data['message'] = 'An error occurred.'

        response.data = error_data
    else:
        # Unhandled exception — log it
        logger.exception(f'Unhandled exception in {context.get("view", "unknown")}: {exc}')
        response = Response({
            'success': False,
            'status_code': 500,
            'message': 'An internal server error occurred.',
            'errors': {},
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return response
