include .env

all:
	make install
	make build
	
install:
	touch yarn.lock
	yarn

build:
	rm -rf .binaries
	mkdir -p .binaries
	make hardhat
	make api-evm
	make playground
	cp -r packages/playground/dist ./.binaries/playground
	rm -rf packages/playground/dist

hardhat:
	yarn workspace @collective-governance/hardhat build
	npm pack --pack-destination .binaries --workspaces ./packages/hardhat

api-evm:
	yarn workspace @collective-governance/api-evm build
	npm pack --pack-destination .binaries --workspaces ./packages/api-evm

playground:
	yarn workspace @collective-governance/playground build

tests:
	yarn workspace @collective-governance/api-evm test
	yarn workspace @collective-governance/hardhat test

deploy-multicall2:
	cd packages/hardhat && npx hardhat --network ${NETWORK} deploy-multicall2

deploy-dao:
	cd packages/hardhat && npx hardhat --network ${NETWORK} deploy-dao --name '${NAME}' --symbol '${SYMBOL}' --purpose '${PURPOSE}'

upgrade-deps:
	yarn up '@types/*' '@rollup/*' rollup rollup-plugin-peer-deps-external prettier vite vite-tsconfig-paths \
	'@mui/*' '@emotion/*' notistack graphql 'graphql-*' '@vitejs/*' react react-dom react-router-dom \
	i18next react-i18next '@openzeppelin/*' glob hardhat 'hardhat-*' '@esbuild-plugins/*'