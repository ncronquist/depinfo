#!/bin/sh

set -e

if echo "$GITHUB_REF" | grep -qE '(refs/heads/master|refs/heads/pre/.*)'; then
    echo "Is Deploy Branch - Continue"
else
    echo "Not a Deploy Branch - "
    # Neutral Failure
    exit 78
fi
