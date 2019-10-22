// const npmFetch = require('npm-registry-fetch');
//
// npmFetch.json('underscore@1.9.1')
//     .then(results => {
//         console.log('RESULTS:', results);
//     })
//

const pacote = require('pacote');

pacote.manifest('underscore@1.9.1')
    .then(pkg => {
        console.log('PKG:', pkg);
    })
