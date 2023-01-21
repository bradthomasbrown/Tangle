FROM alpine:latest
WORKDIR /app
RUN apk add nodejs gcompat
COPY app.mjs genesis_template.json init ./
COPY geth /usr/local/bin
CMD ./init