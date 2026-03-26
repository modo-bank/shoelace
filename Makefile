DOCKER_BIN=docker run -it --rm
DOCKER_RUN=${DOCKER_BIN} -v ${PWD}:/app -w /app

DOCKER_NODE=node:24
ENSURE_INSTALL=@[ -d "node_modules" ] || $(MAKE) install
ENSURE_BUILD=@[ -d "dist" ] || $(MAKE) build

.PHONY: shell install update build dev verify

shell:
	@${DOCKER_RUN} ${DOCKER_NODE} bash

install:
	@${DOCKER_RUN} ${DOCKER_NODE} npm install

update:
	@${DOCKER_RUN} ${DOCKER_NODE} npm update

build:
	@${ENSURE_INSTALL}
	@${DOCKER_RUN} ${DOCKER_NODE} npm run build

start:
	@${ENSURE_INSTALL}
	@${DOCKER_RUN} -p 4000:4000 ${DOCKER_NODE} npm run start

verify:
	@${DOCKER_RUN} ${DOCKER_NODE} npm run verify
