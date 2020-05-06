# TRACTION MediaVault

This repository contains the MediaVault code for the TRACTION EU-project. This
is a Node.js based web application written in TypeScript, using Express.js as
backend framework, MongoDB as database and React for the frontend.

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
