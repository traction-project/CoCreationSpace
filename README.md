# TRACTION MediaVault

![Docker Image CI](https://github.com/tv-vicomtech/traction_MediaVault/workflows/Docker%20Image%20CI/badge.svg)

This repository contains the MediaVault code for the TRACTION EU-project. This
is a Node.js based web application written in TypeScript, using Express.js as
backend framework, MongoDB as database and React in combination with Redux for
the frontend.

## Launching

Before launching the application for the first time, make sure to rename the
file `.env-sample` to `.env` and fill in the required config values inside the
file. Also make sure that this new file is not committed to version control.

The application as well as the database run as Docker containers and can be
launched easily using the following command:

    docker-compose up

During first launch, all required images will be fetched and the images will be
assembled. This will take some time, but subsequent launches will be faster as
only updated parts of the images need to be reassembled.

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
following command:

    yarn test

This will run all unit tests and generate a test report. Extended coverage
analysis can be found in the folder `coverage/`.
