FROM alpine:latest
RUN apk add npm openssl; \
    npm create -y vite@latest app -- --template vue-ts;
WORKDIR /secret
RUN openssl req -newkey rsa:2048 -new -subj "/C=US/" -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
WORKDIR /app
RUN npm install; \
    npm i @vitejs/plugin-vue ethers@5.7.2; \
    npm i -g vite
COPY vite.config.ts .
COPY app.mjs app.yaml package.json /tmp/
CMD npm run dev