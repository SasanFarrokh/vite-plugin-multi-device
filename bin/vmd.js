const vmd = require('../dist/index')

console.log(vmd.default)
vmd.default.createDevServer().listen(3000)
