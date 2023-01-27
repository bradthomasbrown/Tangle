FROM ethereum/client-go:latest AS eth

FROM alpine:latest AS chain
COPY --from=eth / /
WORKDIR /app
COPY genesis.json init execpipe ./
CMD ./init