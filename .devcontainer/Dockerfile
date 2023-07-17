FROM mcr.microsoft.com/devcontainers/base:alpine-3.18

# hadolint ignore=DL3018
RUN apk update && apk add --no-cache \
    nodejs \
    npm \
    yarn \
    git \
    openssh-client \
    && rm -rf /var/cache/apk/*

WORKDIR /work

# install deps from package.json
COPY ../package.json .
RUN yarn install --frozen-lockfile && \
    yarn cache clean
