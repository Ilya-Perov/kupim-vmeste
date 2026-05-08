import logging


logger = logging.getLogger("app")


class RequestLoggerAdapter(logging.LoggerAdapter):
    def process(self, msg, kwargs):
        request = self.extra.get("request")

        kwargs.setdefault("extra", {})

        kwargs["extra"]["request_id"] = getattr(request, "request_id", None)

        user = getattr(request, "user", None)
        kwargs["extra"]["username"] = user.username if user and user.is_authenticated else None

        return msg, kwargs


def get_logger(request):
    return RequestLoggerAdapter(logger, {"request": request})
