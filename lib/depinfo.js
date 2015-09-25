// REQUIRE
// #############################################################################
var exec = require('child_process').exec;
var _ = require('underscore');
var fs = require('fs');

var mods;

var child = exec('npm ls --json --long --prod --dev', {maxBuffer: 1024 * 5000}, function(err, stdout, stderr) {
  if (err) throw err;
  mods = JSON.parse(stdout);

  // GLOBAL VARIABLES
  // #############################################################################
  var dependencies = {};
  var markdown = '';

  // FUNCTIONS
  // #############################################################################

  var getModDependencies = function(mods) {
    return mods.dependencies;
  }

  var getDependencyInfo = function(dep) {
    var depInfo = {};

    if (!dep.name) {
      return '';
    }

    depInfo.name = (dep.name || '');
    depInfo.version = (dep.version || 0);

    if (dep.repository && dep.repository.url) {
      depInfo.repository = dep.repository.url;
    } else {
      depInfo.repository = '**MISSING**';
    }

    // Get license info
    if (dep.license) {
      depInfo.license = dep.license;
    }
    if (dep.licenses) {
      depInfo.license = dep.licenses;
    }

    return depInfo;
  }


  var loopDependencies = function(deps) {

    for (dep in deps) {
      var info = getDependencyInfo(deps[dep]);
      if (info !== '') {
        dependencies[dep] = info;
      }

      if (deps[dep].dependencies && _.isEmpty(deps[dep].dependencies) !== true) {
        loopDependencies(deps[dep].dependencies);
      }
    }

  }

  var writeMarkdown = function(deps) {
    markdown += '# Code Dependencies for ' + mods.name + '\n'
    // markdown += 'Name | Version | Repository | License Type | License \n ----- | ----- | ----- | ----- | -----\n'
    markdown += 'Name | Version | Repository | License Type \n ----- | ----- | ----- | ----- \n'

    for (dep in deps) {
      markdown += deps[dep].name + ' | ' + deps[dep].version + ' | [' + deps[dep].repository + '](http://' + deps[dep].repository.substring(deps[dep].repository.indexOf('github.com'), deps[dep].repository.indexOf('.git')) + ') | ';

      if (!deps[dep].license) {
        // console.log(dep + ' has no license');
        markdown += ' |  \n'
        // console.log(' |  \n');
      } else if (typeof deps[dep].license === 'string') {
        // console.log(dep + ' license is a string');
        markdown += deps[dep].license + ' | ' + ' \n';
        // console.log(deps[dep].license + ' | ' + ' \n');
      } else if (_.isArray(deps[dep].license)) {
        if (deps[dep].license.length > 1) throw err;
        markdown += deps[dep].license[0]['type'] + ' | \n' //+ deps[dep].license[0].url + '\n';
      } else {
        // console.log(dep + ' has an object license');
        markdown += deps[dep].license['type'] + ' | \n' //+ deps[dep].license.url + '\n';
      }
    }

    markdown += '\n\n## Licenses'
    markdown += '\n\n[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)'
    markdown += '\n\n[BSD](https://en.wikipedia.org/wiki/BSD_licenses)'
    markdown += '\n\n[BSD 2-Clause](http://opensource.org/licenses/BSD-2-Clause)'
    markdown += '\n\n[BSD 3-Clause](http://opensource.org/licenses/BSD-3-Clause)'
    markdown += '\n\n[ISC](http://opensource.org/licenses/ISC)'
    markdown += '\n\n[MIT](http://opensource.org/licenses/MIT)'

  }

  var modDeps = getModDependencies(mods);

  loopDependencies(modDeps);

  writeMarkdown(dependencies);

  var child = exec('pwd', function(err, stdout, stderr) {
    if (err) throw err;

    var pwd = stdout;
    // replace new line characters
    pwd = pwd.replace(/^\s+|\s+$/g, '');

    fs.writeFile(pwd + '/dependencies.md', markdown, function(err) {
      if(err) {
          return console.log(err);
      }

      console.log(pwd + '/dependencies.md was created!');
    });
  });
});
