const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const express = require('express');
const Dotenv = require('dotenv-webpack');
const {generateJWTHash} = require('d5-cli/dist/utils/JWK');
require('dotenv-flow').config();
const moduleConfig = require('./module.config.json');
const filesPath = `/app/${moduleConfig.name}`;

const mode = process.env.NODE_ENV || 'development';
const isProd = mode === 'production';

const PORT = process.env.PORT || 4000;

const plugins = [
  new MiniCssExtractPlugin(),
  new Dotenv(),
];

const DIST_PATH = path.resolve(__dirname, 'dist/client');

const WEBPACK_CHUNK_OBJECT = 'webpackChunk' + moduleConfig.name;

const host = process.env.HOST;
const isDebugMode = process.env.DEBUG_SERVER;
const jsDebugKey = isDebugMode ? process.env.JS_DEBUG_KEY || generateJWTHash(host) : null;

module.exports = {
  mode,
  devtool: !isProd ? 'cheap-source-map' : false,
  entry: './client/buildIndex.js',
  output: {
    filename: 'loadUserScriptByName.js',
    path: DIST_PATH,
    uniqueName: moduleConfig.name,
    chunkLoadingGlobal: WEBPACK_CHUNK_OBJECT,
    chunkFilename: (pathData) => {
      return '[name].[contenthash].js';
    },
  },
  optimization: {
    removeAvailableModules: isProd,
    removeEmptyChunks: isProd,
  },
  plugins,
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader?url=false',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader?url=false',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
    ],
  },
  devServer: {
    compress: true,
    liveReload: true,
    setupMiddlewares: (middlewares, devServer) => {
      devServer.app.use(`${filesPath}/resources`, express.static(path.resolve(__dirname, 'client/resources')));
      return middlewares;
    },
    devMiddleware: {
      index: false,
    },
    client: {
      overlay: false,
    },
    port: PORT,
    proxy: {
      context: () => true,
      '/wapi': {
        target: host,
        changeOrigin: true,
        cookieDomainRewrite: 'localhost:' + PORT,
        secure: false,
        onProxyReq: (proxyReq) => {
          if (!jsDebugKey) {
            return;
          }

          proxyReq.setHeader('x-d5-wapi-js-code', jsDebugKey);
        },
        onProxyRes: (proxyRes, req, res) => {
          const cookies = proxyRes.headers['set-cookie'];
          if (!Array.isArray(cookies)) {
            return;
          }
          proxyRes.headers['set-cookie'] = cookies.map((cookie) => {
            return cookie.split(';').filter((v) => v.trim().toLowerCase() !== 'secure').join('; ');
          });
        },
      },
      [`${filesPath}/scripts`]: {
        secure: false,
        target: 'http://localhost:' + PORT,
        pathRewrite: {
          [`^${filesPath}/scripts`]: '',
        },
      },
      '/': {
        target: host,
        changeOrigin: true,
      },
    },
  },
};
