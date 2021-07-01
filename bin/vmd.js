const vmd = require('../dist/index')

const PORT = process.env.PORT || 3000

vmd.createDevServer().listen(PORT, () => {
    console.log(`[ Vite Multi Device running on port: ${PORT} ]`)
})
