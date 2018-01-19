const path = require('path');
const solc =  require('solc');
const fsExtra = require('fs-extra');

const buildPath = path.resolve(__dirname, 'build');
fsExtra.removeSync(buildPath);

const input = {};
let compiledContracts = {};

const campaignPath = path.resolve(__dirname, 'contracts');
fsExtra.readdirSync(campaignPath).forEach((fileName) => {
  try {
    input[fileName] = fsExtra.readFileSync(`${campaignPath}/${fileName}`, 'utf8');
  } catch (err) {
    console.log('file reading err\n', err);
  }
});

try {
  compiledContracts = solc.compile({sources: input}, 1).contracts;
  if (compiledContracts.errors) throw compiledContracts.errors;
} catch (err) {
  console.log('compile err\n', err);
}

fsExtra.ensureDirSync(buildPath);
fsExtra.appendFileSync(`${buildPath}/index.js`, 'module.exports = {\n');

Object.keys(compiledContracts).forEach((contract) => {
  const contractName = `${contract.split(':')[1]}`;
  const contractFileName = `${contractName}.json`;
  const importTemplate = `\t${contractName}: require('./${contractFileName}'),\n`;

  fsExtra.appendFileSync(`${buildPath}/index.js`, importTemplate);
  fsExtra.outputJsonSync(
    path.resolve(buildPath, contractFileName),
    compiledContracts[contract]
  );
});

fsExtra.appendFileSync(`${buildPath}/index.js`, '};\n');
