FROM alpine:latest
RUN apk add npm; \
    npm install -g typescript
WORKDIR /app
COPY createSvelte.mts tsconfig.json ./
RUN npm i create-svelte; \
    tsc; \
    node createSvelte.mjs
WORKDIR /app/app
COPY package.json .
RUN npm install; \
    npm i \
        smui-theme \
        @smui/button \
        @smui/icon-button \
        @smui-extra/accordion \
        @smui/textfield \
        @smui/select \
        @smui/switch \
        @smui/list \
        @smui/circular-progress \
        ethers6@npm:ethers \
        idb-keyval
COPY static static