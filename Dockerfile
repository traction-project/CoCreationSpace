FROM troeggla/node-traction-mediavault:latest

ADD . /code/
WORKDIR /code

RUN yarn install && \
    yarn build

EXPOSE 3000

CMD ["yarn", "start"]
