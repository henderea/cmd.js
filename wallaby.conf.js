module.exports = function(wallaby) {
    return {
        files: [
            'lib/**/*.js',
            'package.json',
            'index.js'
        ],
        tests: [
            'test/**/*.js'
        ],
        env: {
            type: 'node'
        }
    }
}