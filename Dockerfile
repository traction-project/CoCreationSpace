FROM troeggla/node-traction-mediavault:alpine-3.11 AS frontend

ADD ./public /code/
WORKDIR /code

RUN yarn install && \
    yarn build && \
    yarn cache clean && \
    rm -rf node_modules/

FROM troeggla/node-traction-mediavault:alpine-3.11 AS backend

ADD . /code/
WORKDIR /code

COPY --from=frontend /code public/

RUN yarn install && \
    yarn build && \
    yarn cache clean

EXPOSE 3000
CMD ["yarn", "start"]
