FROM alpine:latest
WORKDIR /app
RUN apk add nodejs gcompat
COPY app.mjs .
COPY solc /usr/local/bin
# CMD ./app.mjs