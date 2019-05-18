#!/bin/sh

set -e

# Stolen and modified from https://github.com/actions/npm/blob/master/entrypoint.sh

if [ -n "$NPM_AUTH_TOKEN" ]; then
  # Respect NPM_CONFIG_USERCONFIG if it is provided, default to $HOME/.npmrc
  NPM_CONFIG_USERCONFIG="${NPM_CONFIG_USERCONFIG-"$HOME/.npmrc"}"
  NPM_REGISTRY_URL="${NPM_REGISTRY_URL-registry.npmjs.org}"
  NPM_STRICT_SSL="${NPM_STRICT_SSL-true}"
  NPM_REGISTRY_SCHEME="https"
  if ! $NPM_STRICT_SSL
  then
    NPM_REGISTRY_SCHEME="http"
  fi

  # Allow registry.npmjs.org to be overridden with an environment variable
  printf "//%s/:_authToken=%s\\nregistry=%s\\nstrict-ssl=%s" "$NPM_REGISTRY_URL" "$NPM_AUTH_TOKEN" "${NPM_REGISTRY_SCHEME}://$NPM_REGISTRY_URL" "${NPM_STRICT_SSL}" > "$NPM_CONFIG_USERCONFIG"

  chmod 0600 "$NPM_CONFIG_USERCONFIG"
fi

if echo "$GITHUB_REF" | grep -qE 'refs/heads/master'; then
    sh -c "yarn publish $*"
elif echo "$GITHUB_REF" | grep -qE 'refs/heads/pre/.*'; then
    safe_branch_name=$(echo $GITHUB_REF | cut -c 12- | sed -e 's/\//-/g')
    sh -c "yarn publish --tag $safe_branch_name"
else
    # no match, neutral failure
    exit 78
fi
