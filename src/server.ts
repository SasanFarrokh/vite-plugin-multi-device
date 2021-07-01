import fs from 'fs';
import express, { RequestHandler, Application } from 'express';
import path from 'path'
import type { ViteDevServer } from 'vite';
import { DevicesMap, resolveDevice } from './resolveDevice';

const DEVICE_MAP: DevicesMap = {
    mobile: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
    desktop: true,
}

export const deviceMiddleware = (devices: DevicesMap): RequestHandler => (req, res, next) => {
    req.device = resolveDevice(req, devices);
    next();
}

export function createDevServer (root = null, deviceMap = DEVICE_MAP): Application {
    const { createServer: createViteServer } = require('vite');

    const app = express();

    const vite = {} as Record<string, ViteDevServer>;

    // const serverReady: Promise<unknown> =
    (async () => {
        for (const device of Object.keys(deviceMap)) {
            vite[device] = await createViteServer({
                root: root || process.cwd(),
                logLevel: 'info',
                server: {
                    middlewareMode: true,
                },
                cacheDir: 'node_modules/.vite/' + device,
                __DEVICE: device,
            } as any);
        }
    })();

    app.use((req, res, next) => {
        if (Object.keys(vite).length !== Object.keys(deviceMap).length) {
            res.writeHead(503, { 'Retry-After': '5' });
            return res.end(fs.readFileSync(path.resolve(__dirname, '../loading.html'), 'utf-8'));
        }
        next();
    });

    app.use(deviceMiddleware(deviceMap))

    app.use((req, res, next) => {
        if (!req.device) {
            return res.end('Device could not be guessed. check your configurationss.')
        }
        vite[req.device].middlewares.handle(req, res, next);
    });

    return app;
}
