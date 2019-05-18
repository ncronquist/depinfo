#!/bin/sh

set -e

if echo "$GITHUB_REF" | grep -qE 'refs/heads/master'; then
    npm version patch --message "Package version %s created from commit ${GITHUB_SHA}"
elif echo "$GITHUB_REF" | grep -qE 'refs/heads/pre/.*'; then
    safe_branch_name=$(echo $GITHUB_REF | cut -c 12- | sed -e 's/\//-/g')
    npm version prerelease --preid=$safe_branch_name --message "Prerelease version %s created from commit ${GITHUB_SHA}"
else
    # no match, neutral failure
    exit 78
fi

