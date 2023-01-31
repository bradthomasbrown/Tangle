FROM alpine:latest
WORKDIR /app
RUN apk add npm; \
    npm i -g typescript; \
    npm i @types/node ethers
COPY classes classes
COPY functions functions
COPY interfaces interfaces
WORKDIR /app/containers/test
COPY containers/test/tsconfig.json containers/test/test.mts ./
RUN tsc
CMD node test.mjs