FROM alpine:latest
WORKDIR /app
RUN apk add nodejs gcompat
COPY app.mjs .
CMD ./app.mjs