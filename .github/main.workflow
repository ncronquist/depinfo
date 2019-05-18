workflow "CI" {
  resolves = [
    "Publish",
  ]
  on = "push"
}

action "Build" {
  uses = "docker://node:10-alpine"
  runs = "yarn"
  args = "install --frozen-lockfile"
}

action "Filter-Deleted-Branches" {
  uses = "actions/bin/filter@master"
  args = "not deleted_branch"
}

action "Test" {
  needs = ["Build", "Filter-Deleted-Branches"]
  uses = "docker://node:10-alpine"
  runs = "yarn"
  args = "test"
}

action "Is-Deploy-Branch?" {
  needs = "Test"
  uses = "docker://node:10-alpine"
  runs = "./.github/is_deploy.sh"
}

action "Version" {
  needs = "Is-Deploy-Branch?"
  uses = "docker://node:10-jessie"
  runs = "./.github/action_runner.sh"
  args = [
    "git config --global user.email \"nick@ncronquist.com\"",
    "git config --global user.name \"Nick Cronquist\"",
    "./.github/version.sh",
    "git push -u origin HEAD",
  ]
  secrets = ["GITHUB_TOKEN"]
}

action "Publish" {
  needs = "Version"
  uses = "docker://node:10-alpine"
  runs = "./.github/publish.sh"
  args = "--access public"
  secrets = ["NPM_AUTH_TOKEN"]
}
