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
        ai_remarks='Perfectly healthy'
    )
    
    url = reverse('reports-list')
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert len(response.data) == 1
    assert response.data[0]['title'] == 'My Blood Test'
