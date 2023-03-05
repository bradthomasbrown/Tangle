FROM alpine:latest
RUN apk add npm; \
    npm install -g typescript
WORKDIR /foo/bar/
COPY createSvelte.mts .
COPY tsconfig2.json tsconfig.json
RUN npm i create-svelte; \
    tsc; \
    node createSvelte.mjs
WORKDIR /foo/bar/app
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
        @smui/paper \
        ethers6@npm:ethers \
        idb-keyval
COPY static static