var exec = require('child_process').exec;
var _ = require('underscore');
var fs = require('fs');

var getNpmInfo = new Promise(function(resolve, reject) {
  exec('npm ls --json --long --prod --dev', {maxBuffer: 1024 * 5000}, function(err, stdout, stderr) {
    if (err) {
      reject(err);
    } else {
      resolve(JSON.parse(stdout));
    }
  })
})

var getCurrentDirectory = new Promise(function(resolve, reject) {
  exec('pwd', function(err, stdout, stderr) {
    if (err) {
      reject(err);
    } else {
      var pwd = stdout;
      // replace new line characters
      resolve(pwd.replace(/^\s+|\s+$/g, ''));
    }
  })
})

var writeMarkdownFile = function(currentDirectory, markdown) {
  return new Promise(function(resolve, reject) {
    fs.writeFile(currentDirectory + '/dependencies.md', markdown, function(err) {
      if(err) {
        reject(err);
      } else {
        resolve(currentDirectory + '/dependencies.md was created!')
      }
    })
  })
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

var loopDependencies = function(dependencyList, dependencyInfo) {
  if (!dependencyInfo) {
    dependencyInfo = {};
  };
  for (dep in dependencyList) {
    var info = getDependencyInfo(dependencyList[dep]);
    if (info !== '') {
      dependencyInfo[dep] = info;
    }
    if (dependencyList[dep].dependencies && _.isEmpty(dependencyList[dep].dependencies) !== true) {
      loopDependencies(dependencyList[dep].dependencies, dependencyInfo);
    }
  }
  return dependencyInfo;
}

var writeMarkdown = function(projectName, deps) {
  var markdown = '';
  markdown += '# Code Dependencies for ' + projectName + '\n'
  markdown += 'Name | Version | Repository | License Type \n ----- | ----- | ----- | ----- \n'

  for (dep in deps) {
    markdown += deps[dep].name + ' | ' + deps[dep].version + ' | [' + deps[dep].repository + '](http://' + deps[dep].repository.substring(deps[dep].repository.indexOf('github.com'), deps[dep].repository.indexOf('.git')) + ') | ';

    if (!deps[dep].license) {
      markdown += ' |  \n'
    } else if (typeof deps[dep].license === 'string') {
      markdown += deps[dep].license + ' | ' + ' \n';
    } else if (_.isArray(deps[dep].license)) {
      if (deps[dep].license.length > 1) throw err;
      markdown += deps[dep].license[0]['type'] + ' | \n'
    } else {
      markdown += deps[dep].license['type'] + ' | \n'
    }
  }

  markdown += '\n\n## Licenses';
  markdown += '\n\n[Apache 2.0](http://www.apache.org/licenses/LICENSE-2.0)';
  markdown += '\n\n[BSD](https://en.wikipedia.org/wiki/BSD_licenses)';
  markdown += '\n\n[BSD 2-Clause](http://opensource.org/licenses/BSD-2-Clause)';
  markdown += '\n\n[BSD 3-Clause](http://opensource.org/licenses/BSD-3-Clause)';
  markdown += '\n\n[ISC](http://opensource.org/licenses/ISC)';
  markdown += '\n\n[MIT](http://opensource.org/licenses/MIT)';

  return markdown;

}

Promise.all([getNpmInfo, getCurrentDirectory])
.then(function(values) {
  var projectName = values[0].name;
  var dependencyList = values[0].dependencies;
  var currentDirectory = values[1];

  // Get only the dependency information we actually want
  var dependencyInfo = loopDependencies(dependencyList);

  // Write the json dependency information into a markdown formatted string
  var markdown = writeMarkdown(projectName, dependencyInfo);

  // Write the markdown string to a markdown file
  return writeMarkdownFile(currentDirectory, markdown);
})
.then(function(result) {
  console.log(result);
})
.catch(function(err) {
  console.log(err);
})
