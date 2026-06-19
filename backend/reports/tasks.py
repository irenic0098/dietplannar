from celery import shared_task
import logging

logger = logging.getLogger('dietplanner')


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def analyze_health_report_task(self, report_id: int):
    """Celery task: AI-analyze a health report asynchronously."""
    try:
        from reports.models import HealthReport
        from reports.services import ReportAnalysisService
        report = HealthReport.objects.get(id=report_id)
        ReportAnalysisService.analyze(report)
        logger.info(f'Report {report_id} analysis completed.')
    except Exception as exc:
        logger.error(f'Report analysis task failed for {report_id}: {exc}')
        raise self.retry(exc=exc)
