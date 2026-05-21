#!/bin/bash

set -e

export IMAGE_TAG=$(git rev-parse --short HEAD)

echo "========================="
echo "BUILD IMAGES"
echo "========================="

docker compose build

echo "========================="
echo "RUN MIGRATIONS"
echo "========================="

docker compose run --rm backend migrate

echo "========================="
echo "DEPLOY CONTAINERS"
echo "========================="

docker compose up -d

echo "========================="
echo "SEED DATA"
echo "========================="

docker compose run --rm backend seed

echo "========================="
echo "CREATE ADMIN"
echo "========================="

docker compose run --rm backend create-admin

echo "========================="
echo "DONE"
echo "========================="