var CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

const dotenv = require('dotenv').config({ path: __dirname + '/.env' })
const isDevelopment = process.env.NODE_ENV !== 'production'

var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'app.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.bpmn$/,
        use: {
          loader: 'raw-loader'
        }
      },
      {
        test: /\.(sass|less|css)$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: "postcss-loader",
            options: {
              postcssOptions:
              {
                plugins: [
                  require("autoprefixer")()
                ]
              }
            },
          },
          'sass-loader',
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: {
          loader: 'url-loader'
        }
      },
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/index.html', to: '.' },
        { from: 'src/accessControl.js', to: '.' },
        { from: 'src/access-denied.html', to: '.' },
        { from: 'src/assets', to: 'assets' },
      ]
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(dotenv.parsed),
      'process.env.NODE_ENV': JSON.stringify(isDevelopment ? 'development' : 'production'),
    })
  ],

  resolve: {
    fallback: {
      "fs": false,
      "crypto": require.resolve("crypto-browserify"),
      "util": require.resolve("util/"),
      "stream": require.resolve("stream-browserify")
    }
  }

};
