// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');

const isProduction = process.env.NODE_ENV == 'production';

const configs = [
  {
    name: 'web',
    target: 'web',
    entry: './src/client.ts',
    output: {
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'index.html',
      })
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: 'ts-loader',
          exclude: ['/node_modules/'],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  },
  {
    name: 'server',
    target: 'node',
    externals: [nodeExternals()],
    node: {
      global: false,
      __filename: false,
      __dirname: false
    },
    entry: './src/server.ts',
    output: {
      filename: 'server.js',
      path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
      new NodemonPlugin()
    ],
    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/i,
          loader: 'ts-loader',
          exclude: ['/node_modules/'],
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
          type: 'asset',
        },
      ],
    },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
  }
];

module.exports = () => {
  configs.forEach(config => {
    if (isProduction) {
      config.mode = 'production';


    } else {
      config.mode = 'development';
    }
  });
  return configs;
};
