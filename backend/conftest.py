import pytest
from rest_framework.test import APIClient
from accounts.models import User

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def test_user(db):
    return User.objects.create_user(
        username='testuser',
        email='testuser@example.com',
        password='password123',
        role=User.Role.USER
    )

@pytest.fixture
def dietician_user(db):
    return User.objects.create_user(
        username='dietician',
        email='dietician@example.com',
        password='password123',
        role=User.Role.DIETICIAN
    )

@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        username='admin',
        email='admin@example.com',
        password='password123',
        role=User.Role.ADMIN
    )
