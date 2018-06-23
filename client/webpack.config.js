const path = require('path');
const webpack = require('webpack');

module.exports = function (env) {
  const nodeEnv = env && env.prod ? 'production' : 'development';
  const isProd = nodeEnv === 'production';
  const PATH_TARGET = '../static/';

  const plugins = [
    new webpack.EnvironmentPlugin({
      NODE_ENV: nodeEnv
    })
  ];

  if (isProd) {
    plugins.push(
      new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
      }),

      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
          screw_ie8: true,
          conditionals: true,
          unused: true,
          comparisons: true,
          sequences: true,
          dead_code: true,
          evaluate: true,
          if_return: true,
          join_vars: true
        },
        output: {
          comments: false
        }
      })
    );
  }

  return {
    devtool: isProd ? 'source-map' : 'eval',
    context: path.resolve(__dirname, './src'),
    entry: {
      app: './webpack/index.js'
    },
    output: {
      path: path.resolve(__dirname, PATH_TARGET),
      filename: '[name].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: [/node_modules/],
          use: {
            loader: 'babel-loader',
            options: {
              presets: [
                ['env', {
                  targets: {
                    node: '8',
                    browsers: ['last 2 versions']
                  }
                }], 'stage-0', 'react'] }
          }
        },
        {
          test: /\.(css|scss)$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
            options: { name: '[name].[ext]' }
          }
        },
        {
          test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: {
            loader: 'url-loader',
            query: {
              limit: 10000,
              mimetype: 'application/font-woff'
            }
          }
        },
        {
          test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
          use: 'file-loader'
        }
      ]
    }
  };
};
