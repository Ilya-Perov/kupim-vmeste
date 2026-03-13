#!/bin/sh

# Устанавливаем значения по умолчанию, если переменные не заданы
export NGINX_PORT=${NGINX_PORT:-80}
export SERVER_NAME=${SERVER_NAME:-localhost}

# Проверяем, что переменные установлены
echo "Using NGINX_PORT: $NGINX_PORT"
echo "Using SERVER_NAME: $SERVER_NAME"

# Подставляем переменные в конфиг
envsubst '${NGINX_PORT} ${SERVER_NAME}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Проверяем результат
echo "Generated nginx config:"
cat /etc/nginx/conf.d/default.conf

# Запускаем nginx
exec "$@"