#!/bin/bash

URL="http://localhost/api/health"
REQUESTS=500

echo "Starting load test: $REQUESTS requests to $URL"

for i in $(seq 1 $REQUESTS)
do
  curl -s -H "Connection: close" $URL > /dev/null &
done

wait

echo "Load test finished"