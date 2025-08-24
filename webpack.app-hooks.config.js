const path = require('path');

//development
// const mode = process.env.NODE_ENV || 'production';
const mode = process.env.NODE_ENV || 'development';
const isProd = mode === 'production';

module.exports = {
  mode,
  devtool: !isProd ? 'source-map' : undefined,
  entry: './app-hooks.js',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'app-hooks.js',
    path: path.resolve(__dirname, 'dist/app-hooks')
  }
};
