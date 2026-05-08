import logging
import json
import sys


class JsonFormatter(logging.Formatter):
    def format(self, record):
        log_record = {
            "level": record.levelname,
            "message": record.getMessage(),
            "service": "familyshop-backend",
            "request_id": getattr(record, "request_id", None),
            "username": getattr(record, "username", None),
        }

        return json.dumps(log_record)


logger = logging.getLogger("app")

handler = logging.StreamHandler(sys.stdout)
handler.setFormatter(JsonFormatter())

logger.setLevel(logging.INFO)
logger.addHandler(handler)
