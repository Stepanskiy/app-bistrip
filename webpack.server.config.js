const path = require('path');
const glob = require('glob');

//development
// const mode = process.env.NODE_ENV || 'production';
const mode = process.env.NODE_ENV || 'development';

const formsSrc = process.env.SERVER_SRC_DIR || './server/src/objects';

const filesArr = glob.sync((formsSrc + '/**/*{.js,.ts}'));

module.exports = {
  mode,
  devtool: undefined,
  entry: filesArr,
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs|ts|mts|cts)$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist/server')
  },
  externalsType: 'var',
  externals: {
    ApiObjectInitializer: 'ApiObjectInitializer',
  },
};
