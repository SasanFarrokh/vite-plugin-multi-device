import fs from 'fs';
import express, { RequestHandler, Application } from 'express';
import path from 'path'
import type { ViteDevServer } from 'vite';
import { DevicesMap, resolveDevice } from './resolveDevice';

const DEVICE_MAP: DevicesMap = {
    mobile: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
    desktop: true,
}

export const deviceMiddleware = (devicesMap: DevicesMap): RequestHandler => (req, res, next) => {
    req.device = resolveDevice(req, devicesMap);
    next();
}

export function devMiddleware (root = null, deviceMap = DEVICE_MAP): RequestHandler[] {
    const { createServer: createViteServer } = require('vite');

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

    const template = fs.readFileSync('./index.html', 'utf-8');

    return [
        deviceMiddleware(deviceMap),
        (req, res, next) => {
            if (!req.device) {
                return res.end('Device could not be guessed. check your configurations.')
            }

            if (!vite[req.device]) {
                res.writeHead(503, { 'Retry-After': '5' });
                return res.end(fs.readFileSync(path.resolve(__dirname, '../loading.html'), 'utf-8'));
            }

            vite[req.device].middlewares.handle(req, res, next);
        },
        async (req, res) => {
            const url = req.originalUrl;

            // always read fresh template in dev
            const html = await vite[req.device!].transformIndexHtml(url, template);

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        }
    ]
}

export function createDevServer(root = null, deviceMap = DEVICE_MAP): Application {
    const app = express()
    app.use(devMiddleware(root, deviceMap))
    return app
}
