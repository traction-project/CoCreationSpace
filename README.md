# TRACTION MediaVault

This repository contains the MediaVault code for the TRACTION EU-project. This
is a Node.js based web application written in TypeScript, using Express.js as
backend framework, MongoDB as database and React for the frontend.

## Launching

The application as well as the database runs as a Docker container and can be
launched easily using the the following command:

    docker-compose up

During the first launch, all required images will be fetched and the images
will be assembled. This will take some time, but subsequent launches will be
faster as only updated parts of the images need to be reassembled.
