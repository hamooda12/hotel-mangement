#!/bin/bash

source .env.network
source .env.volume

if [ "$(docker volume ls -q --filter name=$VOLUME_NAME)" ]; then
  echo "Volume with the name $VOLUME_NAME already exists, skipping volume creation."
else
  echo "Creating volume $VOLUME_NAME"
  docker volume create $VOLUME_NAME
fi

if [ "$(docker network ls -q --filter name=$NETWORK_NAME)" ]; then
  echo "Network with the name $NETWORK_NAME already exists, skipping network creation."
else
  echo "Creating network $NETWORK_NAME"
  docker network create $NETWORK_NAME
fi