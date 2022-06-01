# TRACTION Co-Creation Space

![Docker Image CI](https://github.com/tv-vicomtech/traction_MediaVault/workflows/Docker%20Image%20CI/badge.svg)

This repository contains the CoCreation Space code for the TRACTION EU-project.
This is a Node.js based web application written in TypeScript, using Express.js
as backend framework, MongoDB as database and React in combination with Redux
for the frontend.

<img src="https://www.traction-project.eu/wp-content/uploads/sites/3/2020/02/Logo-cabecera-Traction.png" align="left"/><em>This tool was originally developed as part of the <a href="https://www.traction-project.eu/">TRACTION</a> project, funded by the European Commission’s <a hef="http://ec.europa.eu/programmes/horizon2020/">Horizon 2020</a> research and innovation programme under grant agreement No. 870610.</em>

## Documentation

The documentation is available here: https://traction-project.github.io/CoCreationSpace

## Prerequisites

The app uses the `yarn` version 1 (https://classic.yarnpkg.com), so make sure
to install it before you get going. Moreover, make sure to install Docker and
`docker-compose` (usually comes packaged with Docker) for running the system
on your local machine

## Tunnelling

The application makes use of Amazon SNS (Simple Notification Service) to be
notified about asynchronous events (such as status updates about video
processing). In order to receive messages, the application needs to subscribe
to the SNS channel using a public names where it is reachable.

The best way to achieve this so far is to create a account with NGrok
(https://www.ngrok.com), download their command line tool, start a tunnel and
put the name of the tunnel into your `.env` file under `SNS_ENDPOINT`.

## Launching

Before launching the application for the first time, make sure to rename the
file `.env-sample` to `.env` and fill in the required config values inside the
file. Also make sure that this new file is not committed to version control.
Further, in order to make use of AWS, make sure to place a JSON file named
`aws.json` containing your AWS access credentials into the root folder. This
file should also **not** be committed to version control.

The application is separated into a frontend and a backend portion. Both have
their own build files and separate dependencies. Before the first launch, you
should run the following command to install all required dependencies. This
needs to be done in both, the root folder and in the folder `public/`:

    yarn install

This will fetch and install all packages. In order to compile and bundle the
application, run the following command. Again, this needs to be done in the
root folder as well as the folder `public/`

    yarn build

This command needs to be re-run every time you change any of the code. You
can also attach the flag `-w` to the command to make sure the command keeps
watching the directory for changes and recompiles the bundle automatically
using incremental compilation.

The application as well as the database run as Docker containers and can be
launched easily using the following command:

    docker-compose up

During first launch, all required images will be fetched and the containers
will be assembled. This will take some time, but subsequent launches will be
faster as only updated parts of the images need to be reassembled.

**Note:** If you are not planning on doing any development and simply want to
run the application locally, make sure to remove the following lines from the
file `docker-compose.yml` (alternatively create a copy of the file with the
lines removed):

    volumes:
      - .:/code

Removing these lines will prevent the host directory from being mounted inside
the container and compiled bundles being overridden.

## Testing

To run the unit tests, make sure you have `yarn` installed as well as all
development packages are installed by running `yarn install`. Following this,
you can run the unit tests and generate a coverage report by invoking the
following command in the root folder:

    yarn test

This will run all unit tests and generate a test report. Extended coverage
analysis can be found in the folder `coverage/`.

## Data Model Migrations

Migrations allows to keep track of changes to the database schema. To each action that we are going to do with database schema (update a table, delete a table or create a new one), we must create a new migration file. This files are located in `migrations/` folder.

If we do a change in the database schema, we must do the next steps:

1. We must create another migration file where we set the logic that we must do:

```bash
    npx sequelize migration:generate --name action_name
```

This will generate a new file XXXXXX-action_name.js in `migrations/` folder. To run this action, we must write the next command:

```bash
    npx sequelize db:migrate
```

If we want to undo this actions, we can write the next command:

```bash
    npx sequelize db:migration:undo
```

2. We have to update the respective model in `models/` folder. For example, if we want to add a new column in users Table, we must update `models/users.ts`.  This folder is used by the backend in order to connect with the database and work with it.

