FROM alpine:latest
RUN apk add npm; \
    npm create -y vite@latest app -- --template vue-ts;
WORKDIR /app
RUN npm install; npm i @vitejs/plugin-vue @ethersproject/providers
COPY vite.config.ts .
CMD npm run dev