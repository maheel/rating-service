const YAML = require('js-yaml');
const fs = require('fs');

const path = './functions/';

module.exports = () => {
  let functionsData = '';
  const files = fs.readdirSync(path);

  files.forEach(file => {
    if (file.match('.yml')) {
      functionsData = `${functionsData}\n${fs.readFileSync(`${path}${file}`)}`;
    }
  }, this);

  return YAML.safeLoad(functionsData, 'utf8');
};
