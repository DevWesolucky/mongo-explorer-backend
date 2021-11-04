# Development environment


## Create mongo and backend app in two separate containers

#### Create mongo network
```docker
docker network create mongo-net
```

#### Run mongo container with defined network
```docker
docker run -d --network mongo-net --name mongo-container \
-e MONGO_INITDB_ROOT_USERNAME=root \
-e MONGO_INITDB_ROOT_PASSWORD=example \
mongo
```

#### Build backend app image (inside project folder with Dockerfile)
```docker
docker build -t backend-image .
```

#### Run backend app container with mongo network and MONGO_URI
```docker
docker run -d --network mongo-net --name backend-container \
-p 5000:8000 \
-e PORT=8000 \
-e MONGO_URI=mongodb://root:example@mongo-container:27017 \
backend-image
```

#### Check PM2 running app logs
```docker
pm2 logs
```

## Create mongo and backend app in docker compose
TO DESCRIBE

## Development in docker with VS Code extensions and settings
TO DESCRIBE

## Docker commands

#### remove all unused images, container, volumes, networks
```
docker system prune -af
```
#### docker image list
```
docker image ls
```
#### build image from path with Dockerfile
```
docker build -t IMG_NAME .
```
#### delete image
```
docker image rm C_ID
```
#### run container port 5000 on host to 8000 for app in container
```
docker run -p 5000:8000 -d --name C_NAME IMG_NAME
```
#### list containers
```
docker ps -a
```
#### delete container
```
docker rm C_ID -f
```
#### bash inside container
```
docker exec -it C_ID bash
```
#### cosole/terminal logs inside container
```
docker logs C_ID
```
#### others
```
docker volume -h
docker network -h
```

## Links
- [VS Code git ssh in container](https://code.visualstudio.com/docs/remote/containers#_sharing-git-credentials-with-your-container)
- [Official mongo image](https://hub.docker.com/_/mongo)
- [PM2 in docker](https://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/)
- [Official docker tutorial (node app + mongo)](https://docs.docker.com/language/nodejs/develop/)
- [Define network in compose file](https://docs.docker.com/compose/networking/)

- [VS Code setup container](https://code.visualstudio.com/docs/remote/create-dev-container#_set-up-a-folder-to-run-in-a-container) 
- [First chapters of long tutorial](https://youtu.be/jotpVtFwYBk)

- [Markdown](https://guides.github.com/features/mastering-markdown/)