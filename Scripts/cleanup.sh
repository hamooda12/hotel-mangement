#!/bin/bash

source .env.network
source .env.volume
source .env.db

if [ "$(docker ps -aq --filter name=$DB_CONTAINER_NAME)" ]; then
  echo "Removing container $DB_CONTAINER_NAME"
  docker kill $DB_CONTAINER_NAME
else
  echo "Container with the name $DB_CONTAINER_NAME does not exist, skipping container deletion."
fi

if [ "$(docker network ls -q --filter name=$NETWORK_NAME)" ]; then
  echo "Removing network $NETWORK_NAME"
  docker network rm $NETWORK_NAME
else
  echo "Network with the name $NETWORK_NAME does not exist, skipping network deletion."
fi

if [ "$(docker volume ls -q --filter name=$VOLUME_NAME)" ]; then
  echo "Removing volume $VOLUME_NAME"
  docker volume rm $VOLUME_NAME
else
  echo "Volume with the name $VOLUME_NAME does not exist, skipping volume deletion."
fi