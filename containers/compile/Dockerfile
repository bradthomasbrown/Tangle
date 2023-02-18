FROM ethereum/solc:0.4.18 AS s418
FROM ethereum/solc:0.5.16 AS s516
FROM ethereum/solc:0.6.6 AS s606
FROM ethereum/solc:0.8.18 AS s818

FROM alpine:latest
WORKDIR /app
RUN apk add git jq nodejs; \
    git clone https://github.com/Uniswap/v2-core; \
    git clone https://github.com/Uniswap/v2-periphery; \
    git clone https://github.com/Uniswap/solidity-lib; \
    git clone https://github.com/martinsawstrom/WETH; \
    find . -type f ! -name "*.sol" -delete; \
    sed -i "s/hex.*init code hash/hex'1c953a1d30b50f18ca97ba18fa87cd2aebb9bdf5467ef067502ffb090024f0b6'/" v2-periphery/contracts/libraries/UniswapV2Library.sol; \
    sed -i 's/constructor/function initCodeHash() external pure returns (bytes32) { return keccak256(abi.encodePacked(type(UniswapV2Pair).creationCode)); } \n\n\tconstructor/' v2-core/contracts/UniswapV2Factory.sol
COPY --from=s418 /usr/bin/solc /usr/bin/s418
COPY --from=s516 /usr/bin/solc /usr/bin/s516
COPY --from=s606 /usr/bin/solc /usr/bin/s606
COPY --from=s818 /usr/bin/solc /usr/bin/s818
WORKDIR /app/containers/compile
COPY lib lib
COPY json json