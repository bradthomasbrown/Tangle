FROM alpine:latest
WORKDIR /app
RUN apk add nodejs gcompat
COPY app.mjs ./
COPY geth /usr/local/bin
CMD geth \
        --dev \
        --http \
        --http.api eth,web3,net \
        --http.corsdomain "*" \
        --http.addr "0.0.0.0" \
        --http.vhosts "*" & \
    ./app.mjs
