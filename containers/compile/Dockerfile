FROM ethereum/solc:0.4.18 AS s418
FROM ethereum/solc:0.5.16 AS s516
FROM ethereum/solc:0.6.6 AS s606
FROM ethereum/solc:0.8.17 AS s817

FROM alpine:latest
WORKDIR /app
RUN apk add git jq; \
    git clone https://github.com/Uniswap/v2-core; \
    git clone https://github.com/Uniswap/v2-periphery; \
    git clone https://github.com/Uniswap/solidity-lib; \
    git clone https://github.com/martinsawstrom/WETH; \
    find . -type f ! -name "*.sol" -delete;
COPY --from=s418 /usr/bin/solc /usr/bin/s418
COPY --from=s516 /usr/bin/solc /usr/bin/s516
COPY --from=s606 /usr/bin/solc /usr/bin/s606
COPY --from=s817 /usr/bin/solc /usr/bin/s817
WORKDIR /app/containers/compile
COPY lib lib
COPY json json
CMD lib/compile tangle weth factory router