## Installation Docker

For running this project loccaly you should:
  - install Node.js v16.15.0
  - install and run Docker

## Installation project

```bash
$ npm install
```

## Create .env file and add config items
```
PORT=5000

POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_DB=game_shop
POSTGRES_PASSWORD=root
POSTGRES_PORT=5433

ROOT_ADMIN_EMAIL=
ROOT_ADMIN_PASSWORD=

AWS_ACCESS_KEY_ID=localstack
AWS_SECRET_KEY=localstack
AWS_BUCKET_NAME=s3-game-shop
AWS_REGION=us-west-2
AWS_LOCAL_ENDPOINT=http://localhost:4566

MAILER_SERVICE=gmail
MAILER_ADMIN_USER=
MAILER_ADMIN_PASSWORD=

FRONTEND_URL=http://localhost:3000

REGISTRATION_USER_SECRET=
REGISTRATION_USER_EXPIRES_IN=

```

## Installation db locally

```bash
$ npm run docker:up
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
