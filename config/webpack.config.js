module.exports = {
    entry: "./assets/scripts/app.js",
    output: {
        path: './public/dist/scripts/',
        filename: "app.js"
    },
    module: {
        preLoaders: [
            {
                test: /\.js?$/,
                loader: 'eslint',
            },
        ],
        loaders: [
            {
                test: /.js?$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,
                loaders: ['sass-loader','style-loader']
            }
        ]
    }
};