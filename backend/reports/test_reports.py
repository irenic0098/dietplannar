import pytest
from django.urls import reverse
from rest_framework import status
from reports.models import HealthReport

@pytest.mark.django_db
def test_list_reports_requires_auth(api_client):
    url = reverse('reports-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.django_db
def test_list_reports(api_client, test_user):
    # Setup some report
    HealthReport.objects.create(
        user=test_user,
        title='My Blood Test',
        report_type='blood_test',
        status='completed',
        ai_summary='Perfectly healthy'
    )
    
    url = reverse('reports-list')
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['count'] == 1
    assert len(response.data['reports']) == 1
    assert response.data['reports'][0]['title'] == 'My Blood Test'
