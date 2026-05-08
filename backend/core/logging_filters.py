import logging


class RequestContextFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(record, "request_id", None)
        record.username = getattr(record, "username", None)
        return True
