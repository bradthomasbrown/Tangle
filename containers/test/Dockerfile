FROM alpine:latest
WORKDIR /app
RUN apk add npm; \
    npm i -g typescript; \
    npm i \
        @types/node \
        ethers5@npm:ethers@5.7.2 \
        level
COPY classes classes
COPY functions functions
COPY interfaces interfaces
COPY json json
WORKDIR /app/containers/test
COPY containers/test/tsconfig.json containers/test/*.mts ./
RUN tsc
CMD node deploy.mjs