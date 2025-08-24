const fs = require('fs');
const path = require('path');
const glob = require('glob');
const {exec} = require('node:child_process');
const execArgs = require('minimist')(process.argv);
require('dotenv-flow').config();
const moduleConfig = require('../module.config.json');

const filesPath = `/app/${moduleConfig.name}`;

const formsSrc = process.env.CLIENT_SRC_DIR || './client/src/forms';

const entries = (formsSrc + '/**/*.js').split(';');

const filesArr = entries.map(entry => glob.sync(entry)).flat();

const createBuildIndexTemplate = (files) => {
  const createSwitch = (files) => {
    return files.map(file => {
      const fileName = path.parse(file).base.split('.')[0];
      return `case '${fileName}': return import(
      '${file.replace('./client', '.')}'
      )`;
    }).join('\n');
  };

  const createDefault = () => {
    return `default: {
       return new Promise((resolve, reject) => {
          if (window.userScript && window.userScript[formName]) {
            return resolve();
          }
          const s = document.createElement('script');
          s.type = 'text/javascript';
          s.src = '${filesPath}/scripts/' + formName + '.js';
          s.onerror = function (event) {
            reject(event);
          };
          s.onload = resolve;
          document.head.append(s);
      }); 
    }`;
  };

  return `
  function loadUserScriptByName (formName)  {
    switch (formName) {
      ${createSwitch(files)}
      ${createDefault()}
    }
  }
  
  window.loadUserScriptByName = loadUserScriptByName;
  window.UserScriptVersionHash = "${process.env.DRONE_COMMIT ||  Math.random()}";
  `;
};

const createBuildIndexFile = (text) => {
  try {
    fs.writeFileSync(path.resolve(__dirname, 'buildIndex.js'), text);
  } catch (err) {
    // When a request is aborted - err is an AbortError
    console.error(err);
  }
};

createBuildIndexFile(createBuildIndexTemplate(filesArr));

const handleExec = (error, stdout, stderr) => {
  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
};


let command = '';

if (execArgs.start) {
  if (!process.env.HOST) {
    throw new Error('Please specify HOST in environment variables');
  }
  command = 'webpack serve --open --config webpack.client.config.js';
}

if (execArgs.build) {
  command = 'webpack --config webpack.client.config.js';
}

let child = exec(command, handleExec);

// child.stderr.on('data', (data) => {
//   // console.error(data);
//   // process.exit(1);
//   // child.kill(-1);
// });

child.on('close', (code) => {
  if (code !== 0)
    process.exit(code);
})

child.stdout.on('data', (data) => {
  console.log(data);
});
