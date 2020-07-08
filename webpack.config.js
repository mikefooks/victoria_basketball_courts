const path = require("path");

module.exports = {
    entry: "./src/main.js",
    mode: "development",
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "public")
    },
    optimization: {
        minimize: true
    },
    // devtool: "inline-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [ "@babel/preset-env" ]
                    }
                }
            }
        ]
    }
}
