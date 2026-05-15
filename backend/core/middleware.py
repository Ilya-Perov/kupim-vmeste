import time
import logging
import signal

from django.http import JsonResponse

from middleware.request_id_middleware import generate_human_request_id

logger = logging.getLogger("app")

is_shutting_down = False


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = generate_human_request_id()

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


def shutdown_handler(signum, frame):
    global is_shutting_down
    is_shutting_down = True

    logger.warning(
        "shutdown_signal_received",
        extra={
            "signal": signum,
        },
    )


signal.signal(signal.SIGTERM, shutdown_handler)
signal.signal(signal.SIGINT, shutdown_handler)


class GracefulShutdownMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if is_shutting_down and request.path != "/api/health/":
            return JsonResponse(
                {"detail": "Server shutting down"},
                status=503,
            )

        return self.get_response(request)
