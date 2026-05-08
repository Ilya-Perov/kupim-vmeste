import uuid
import random


ANIMALS = [
    "rhino", "dog", "bear", "fox", "lion", "panda",
    "wolf", "cat", "tiger", "eagle", "shark", "owl"
]


def generate_human_request_id():
    # берём uuid как источник уникальности
    raw = uuid.uuid4().hex

    # делим на части и мапим в животных
    parts = [
        random.choice(ANIMALS),
        random.choice(ANIMALS),
        random.choice(ANIMALS),
    ]

    # добавляем короткий numeric suffix для уникальности
    suffix = str(int(raw[:8], 16))[:3]

    return f"{'-'.join(parts)}-{suffix}"


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID")

        if not request_id:
            request_id = generate_human_request_id()

        request.request_id = request_id

        response = self.get_response(request)
        response["X-Request-ID"] = request_id

        return response
