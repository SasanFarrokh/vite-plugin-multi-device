#!/usr/bin/env node

const cp = require('child_process');
const vmd = require('../dist/index');

const PORT = process.env.PORT || 3000;

const [cmd, output] = process.argv.slice(2);

(async () => {
    if (cmd === 'build') {
        const config = vmd.loadConfig();
        for (const device of vmd.getDevicesArray(config)) {
            console.info('Building device: ' + device);
            process.env.DEVICE = device;
            process.env.NODE_ENV = 'production';
            const sp = cp.spawn(`./node_modules/.bin/vite`, ['build', `--outDir=dist/${device}`]);
            sp.stdout.pipe(process.stdout);
            sp.stderr.pipe(process.stderr);
            await new Promise(resolve => sp.on('close', resolve));
        }
        return;
    }

    const isProd = cmd === 'start';

    (isProd ? vmd.createProdServer(output) : vmd.createDevServer()).listen(PORT, () => {
        console.log(`[ Vite Multi Device ${isProd ? 'production' : 'dev'} server running on port: ${PORT} ]`);
    });
})();
