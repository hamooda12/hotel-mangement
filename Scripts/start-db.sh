#!/bin/bash

source .env.network
source .env.volume
source .env.db

MYSQL_IMAGE=mysql
MYSQL_TAG=8

ROOT_PASSWORD=1234
DATABASE_NAME=key_value_app

LOCALHOST_PORT=3306
CONTAINER_PORT=3306

VOLUME_CONTAINER_PATH=/var/lib/mysql

./setup.sh

if [ "$(docker ps -q --filter name=$DB_CONTAINER_NAME)" ]; then
  echo "Container with the name $DB_CONTAINER_NAME already exists."
  echo "The container will be removed when stopped."
  echo "To stop the container run:"
  echo "docker stop $DB_CONTAINER_NAME"
  exit 1
fi

docker run -d --rm \
  --name $DB_CONTAINER_NAME \
  -e MYSQL_ROOT_PASSWORD=$ROOT_PASSWORD \
  -e MYSQL_DATABASE=$DATABASE_NAME \
  -p $LOCALHOST_PORT:$CONTAINER_PORT \
  -v ./db-config/mysql-init.sql:/docker-entrypoint-initdb.d/mysql-init.sql:ro \
  -v $VOLUME_NAME:$VOLUME_CONTAINER_PATH \
  --network $NETWORK_NAME \
  $MYSQL_IMAGE:$MYSQL_TAG