import type { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import makeDebug from 'debug';
import { resolveDevice } from './resolveDevice';
import { idToFilePath, resolveDeviceFilePath } from './utils';

const defaultOptions = {
    devices: {
        mobile: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
        desktop: true,
    },
    buildFor: process.env.DEVICE || 'desktop',
    id: 'DEVICE',
};

const debug = makeDebug('vite:multi-device');

export default function multiDevice (options: typeof defaultOptions): Plugin[] {
    options = { ...defaultOptions, ...options };

    let { buildFor } = options;
    if (!buildFor) {
        buildFor = Object.keys(options.devices)[0];
    }

    const PACKAGE_NAME = '@xii/vite-plugin-multi-device';
    const DEVICE_PACKAGE_NAME = PACKAGE_NAME + '/device';

    let config: ResolvedConfig;
    return [{
        name: 'vite:multi-device',
        enforce: 'pre',
        configResolved (_config) {
            config = _config;
        },
        configureServer ({ app }) {
            app.use((req, res, next) => {
                const { url } = req;
                if (url === '/@id/' + DEVICE_PACKAGE_NAME) {
                    const device = resolveDevice(req, options.devices);

                    res.setHeader('Content-Type', 'application/javascript');
                    res.end(`
                    window.${options.id} = { ${device}: true }
                    export default app => app.config.globalProperties[${JSON.stringify(options.id)}] = { ${device}: true }
                    `);
                    debug(`apply global property ${options.id}`);
                    return;
                }

                if (url && url[0] === '/' && url[1] !== '@') {
                    const device = resolveDevice(req, options.devices);
                    const filePath = idToFilePath(url, config.root);

                    if (filePath && device) {
                        const deviceFilePath = resolveDeviceFilePath(filePath, device);
                        if (fs.existsSync(deviceFilePath)) {
                            const newUrl = resolveDeviceFilePath(url, device);
                            res.setHeader('Content-Type', 'application/javascript');
                            res.end(`
                            import Component from '${newUrl}';
                            export default Component;
                            export * from '${newUrl}';
                            `.trim());
                            debug(`dev server bridge "${url}" -> "${newUrl}"`);
                            return;
                        }
                    }
                }

                return next();
            });
        },
        resolveId (id) {
            if (id === DEVICE_PACKAGE_NAME) {
                return DEVICE_PACKAGE_NAME;
            }
            const filePath = idToFilePath(id, config.root);
            if (filePath) {
                const deviceFilePath = resolveDeviceFilePath(filePath, buildFor);
                if (fs.existsSync(deviceFilePath)) {
                    debug(`switch id: "${id}" -> "${deviceFilePath}"`);
                    return deviceFilePath;
                }
            }
        },
        load (id) {
            if (id === DEVICE_PACKAGE_NAME) {
                debug(`return empty: ${DEVICE_PACKAGE_NAME}`);
                return '';
            }
        },
    }, {
        name: 'vite:multi-device-build',
        apply: 'build',
        config () {
            debug('_ctx.' + options.id + '.' + buildFor);

            return {
                define: Object.keys(options.devices).reduce((carry, item) => {
                    carry['_ctx.' + options.id + '.' + item] = buildFor === item;
                    carry['window.' + options.id + '.' + item] = buildFor === item;
                    return carry;
                }, {}),
            };
        },
    }];
}
