workflow "CI - Tests and Lint" {
  on = "push"
  resolves = ["Run Tests"]
}

action "CI - Tests and Lint" {
  uses = "actions/npm@59b64a598378f31e49cb76f27d6f3312b582f680"
  runs = "yarn install && yarn test"
}

