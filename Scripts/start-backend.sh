#!/bin/bash

export MSYS_NO_PATHCONV=1

source .env.network
source .env.backend
source .env.db

BACKEND_PROJECT_PATH="C:/Users/tourt/OneDrive/Desktop/dock"

if [ "$(docker ps -aq --filter name=$BACKEND_CONTAINER_NAME)" ]; then
  echo "Container with the name $BACKEND_CONTAINER_NAME already exists."
  echo "To stop the container run:"
  echo "docker kill $BACKEND_CONTAINER_NAME"
  exit 1
fi

echo "Building backend image..."

docker build \
  -t $BACKEND_IMAGE_NAME \
  -f "$BACKEND_PROJECT_PATH/Dockerfile.dev" \
  "$BACKEND_PROJECT_PATH"

echo "Starting backend container..."

docker run -d --rm \
  --name $BACKEND_CONTAINER_NAME \
  --network $NETWORK_NAME \
  -p $BACKEND_LOCALHOST_PORT:$BACKEND_CONTAINER_PORT \
  -v "$BACKEND_PROJECT_PATH/src:/app/src" \
  -v "$BACKEND_PROJECT_PATH/target/classes:/app/target/classes" \
  -e SERVER_PORT=$BACKEND_CONTAINER_PORT \
  -e SPRING_DATASOURCE_URL=jdbc:mysql://$DB_CONTAINER_NAME:3306/$DATABASE_NAME \
  -e SPRING_DATASOURCE_USERNAME=$DATABASE_USER \
  -e SPRING_DATASOURCE_PASSWORD=$DATABASE_PASSWORD \
  $BACKEND_IMAGE_NAME