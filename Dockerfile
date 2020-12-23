FROM troeggla/node-traction-mediavault:latest AS frontend

ADD ./public /code/
WORKDIR /code

RUN yarn install && \
    yarn build && \
    yarn cache clean && \
    rm -rf node_modules/

FROM troeggla/node-traction-mediavault:latest AS backend

ADD . /code/
WORKDIR /code

COPY --from=frontend /code public/

RUN yarn install && \
    yarn build

EXPOSE 3000
CMD ["yarn", "start"]
