import path from 'path';

module.exports = {
     entry: './src/assets/scripts/app.js',
     output: {
         path: './dist/assets',
         filename: 'app.bundle.js'
     },
     module: {
         loaders: [{
             test: /\.jsx?$/,
             exclude: /node_modules/,
             loader: 'babel-loader'
         }]
     },
     resolve: {
         root: [
             path.resolve('./src/assets/scripts')
         ]
     }
 };
