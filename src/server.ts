import fs from 'fs';
import express, { RequestHandler, Application } from 'express';
import path from 'path';
import type { ViteDevServer } from 'vite';
import { DevicesMap, resolveDevice } from './resolveDevice';
import { loadConfig } from "./config";

export const deviceMiddleware = (devicesMap: DevicesMap, fallback: string): RequestHandler => (req, res, next) => {
    req.device = resolveDevice(req, devicesMap) || fallback;
    next();
};

export function devMiddleware (root: string | null = null): RequestHandler[] {
    const { createServer: createViteServer } = require('vite');
    root = root || process.cwd();

    const vite = {} as Record<string, ViteDevServer>;

    const { devices: deviceMap, fallback } = loadConfig();

    if (Array.isArray(deviceMap)) {
        throw new Error('[vite-plugin-multi-device]: to use `vmd` dev server, you should specify devices as an object');
    }

    // const serverReady: Promise<unknown> =
    (async () => {
        const devices = [...new Set([fallback, ...Object.keys(deviceMap)])];
        for (const device of devices) {
            vite[device] = await createViteServer({
                root,
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

    /**
     * Handles Vite transformation
     */
    const viteHandler = (req, res, next) => {
            if (!req.device) {
                return res.end('Device could not be guessed. check your configurations and ensure a fallback is specified.');
            }

            if (!vite[req.device]) {
                res.writeHead(503, { 'Retry-After': '5' });
                return res.end(fs.readFileSync(path.resolve(__dirname, '../loading.html'), 'utf-8'));
            }

            vite[req.device].middlewares.handle(req, res, next);
        };

    /**
     * Handles final html serve with vite transformIndexHtml api
     */
    const htmlHandler = async (req, res) => {
        const url = req.originalUrl;

        // always read fresh template in dev
        const html = await vite[req.device!].transformIndexHtml(url, template);

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    };

    return [
        deviceMiddleware(deviceMap, fallback),
        viteHandler,
        htmlHandler
    ];
}

export function createDevServer(root = null): Application {
    const app = express();
    app.use(devMiddleware(root));
    return app;
}
