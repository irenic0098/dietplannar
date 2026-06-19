import pytest
from django.urls import reverse
from rest_framework import status
from accounts.models import User

@pytest.mark.django_db
def test_user_registration(api_client):
    url = reverse('auth-register')
    data = {
        'username': 'newuser',
        'email': 'newuser@example.com',
        'password': 'strongpassword123',
        'password2': 'strongpassword123',
        'role': 'user'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
    assert 'user' in response.data
    assert response.data['user']['username'] == 'newuser'
    assert User.objects.filter(username='newuser').exists()

@pytest.mark.django_db
def test_user_login(api_client, test_user):
    url = reverse('auth-login')
    data = {
        'email': 'testuser@example.com',
        'password': 'password123'
    }
    response = api_client.post(url, data)
    assert response.status_code == status.HTTP_200_OK
    assert 'tokens' in response.data
    assert 'access' in response.data['tokens']
    assert 'refresh' in response.data['tokens']

@pytest.mark.django_db
def test_admin_stats_permission(api_client, test_user, admin_user):
    url = reverse('admin-stats')
    
    # User attempts to fetch stats
    api_client.force_authenticate(user=test_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # Admin attempts to fetch stats
    api_client.force_authenticate(user=admin_user)
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert 'total_users' in response.data
