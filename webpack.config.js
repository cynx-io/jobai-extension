const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: {
    'linkedin-content-script': './src/linkedin-content-script.ts',
    'cynxio-content-script': './src/cynxio-content-script.ts',
    'background': './src/background.ts'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: 'manifest.json', to: 'manifest.json' },
        { from: 'styles', to: 'styles', noErrorOnMissing: true },
        { from: 'icons', to: 'icons', noErrorOnMissing: true },
        { from: 'popup.html', to: 'popup.html', noErrorOnMissing: true }
      ],
    }),
  ],
};