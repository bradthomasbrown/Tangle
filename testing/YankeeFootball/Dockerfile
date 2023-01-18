FROM alpine:latest
WORKDIR /app
RUN apk add npm; npm i ethers
COPY app.mjs ./
CMD ./app.mjs