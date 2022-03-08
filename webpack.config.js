var CopyPlugin = require('copy-webpack-plugin');

var path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: 'app.js'
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
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'src/index.html', to: '.' },
      ]
    })
  ]
/**
  resolve: {
        fallback: {
            "fs": false
        },
    }
**/
};
