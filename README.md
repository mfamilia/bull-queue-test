# Bull Queue Test

## Dependencies

* Docker
* Docker Compose
* httpie
* Nodejs 14

## Run Redis

```console
docker-compose up -d
```

## Run Dashboard
Default URL: http://localhost:4000/queue/messages

```console
yarn dash
```

## Run Generator
Adds jobs to queue for processing

```console
yarn gen
```

## Run Services
Services that will receive messages, playing the role of external services (open in separate shells)

```console
yarn serv 3001
yarn serv 3002
```

