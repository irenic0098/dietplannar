from django.urls import path
from . import views

urlpatterns = [
    path('', views.reports_list, name='reports-list'),
    path('deficiencies/', views.deficiencies, name='deficiencies'),
    path('nutrition-analysis/', views.nutrition_analysis, name='nutrition-analysis'),
    path('<int:report_id>/', views.report_detail, name='report-detail'),
    path('<int:report_id>/analyze/', views.reanalyze_report, name='report-analyze'),
]
