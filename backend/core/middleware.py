import time
import logging

from .request_id import generate_request_id

logger = logging.getLogger("app")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = generate_request_id()

        request.request_id = request_id

        start = time.time()

        logger.info(
            "request_started",
            extra={
                "request_id": request_id,
                "method": request.method,
                "path": request.path,
            },
        )

        response = self.get_response(request)

        duration = round((time.time() - start) * 1000, 2)

        logger.info(
            "request_finished",
            extra={
                "request_id": request_id,
                "status_code": response.status_code,
                "duration_ms": duration,
            },
        )

        response["X-Request-ID"] = request_id

        return response
