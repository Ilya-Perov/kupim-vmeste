#!/bin/sh

set -e

COMMAND=$1

case "$COMMAND" in
    server)
        exec gunicorn core.wsgi:application \
            --bind 0.0.0.0:5000 \
            --workers 2 \
            --worker-class gevent \
            --timeout 30 \
            --graceful-timeout 30 \
            --keep-alive 5
        ;;

    migrate)
        exec python manage.py migrate
        ;;

    seed)
        exec python manage.py seed
        ;;

    create-admin)
        exec python manage.py createsuperuser_if_not_exists
        ;;

    *)
        exec "$@"
        ;;
esac