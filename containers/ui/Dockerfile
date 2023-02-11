FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:alpine
WORKDIR /ui
RUN apk add npm; \
    npm i -g \
        typescript \
        vite; \
    npm i \
        @vitejs/plugin-vue \
        ethers@5.7.2 \
        @google-cloud/secret-manager \
        express \
        @types/express
RUN npm create -y vite@latest web -- --template vue-ts
WORKDIR /ui/web
RUN npm install
WORKDIR /ui/app
COPY app/* .
WORKDIR /ui/web