FROM alpine:latest
WORKDIR /app
RUN apk add npm; \
    npm i -g typescript; \
    npm i \
        @types/node \
        ethers5@npm:ethers@5.7.2 \
        level \
        @ankr.com/ankr.js \
        @ethersproject/providers \
        normal-distribution
COPY classes classes
COPY containers containers
COPY functions functions
COPY interfaces interfaces
COPY json json
WORKDIR /app/containers/mine
COPY containers/mine/*.json ./
# RUN tsc
# CMD node mine.mjs