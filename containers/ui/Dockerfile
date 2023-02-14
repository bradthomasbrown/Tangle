FROM gcr.io/google.com/cloudsdktool/google-cloud-cli:alpine
WORKDIR /ui
RUN apk add npm; \
    npm i -g \
        typescript \
        vite; \
    npm i \
        @vitejs/plugin-vue \
        ethers5@npm:ethers@5.7.2 \
        @google-cloud/secret-manager \
        express \
        @types/express
RUN npm create -y vite@latest web -- --template vue-ts
WORKDIR /ui/web
RUN npm install
WORKDIR /ui
COPY json json
WORKDIR /ui/app
COPY \
    containers/ui/app/* \
    json/*.json \
    ./
WORKDIR /ui/web