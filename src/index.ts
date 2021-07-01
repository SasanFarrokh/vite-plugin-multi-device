import type { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import makeDebug from 'debug';
import replacePlugin from '@rollup/plugin-replace';
import { idToFilePath } from './utils';

const defaultOptions = {
    devices: ['desktop', 'mobile'],
    replacement: (device: string) => ['DEVICE.' + device, 'window.DEVICE.' + device],
    resolvePath: (path: string, device: string) => path.replace(/\.([^?/\\]+)(\?.*)?$/, `.${device}.$1$2`),
    env: 'DEVICE'
};

const debug = makeDebug('vite:multi-device');

export default function multiDevice (rawOptions?: typeof defaultOptions): Plugin[] {
    const options = { ...defaultOptions, ...(rawOptions || {}) };

    let replacements, buildFor, replace;
    let config: ResolvedConfig;

    function configResolved (_config: ResolvedConfig) {
        config = _config;

        buildFor = (config as any).buildFor || process.env[options.env];
        debug('building for "' + buildFor + '"');

        if (!buildFor || !options.devices.includes(buildFor)) {
            throw new Error('vite-plugin-multi-device: DEVICE is not specified or not listed in devices option: ' + buildFor);
        }

        replacements = options.devices.reduce((carry, item) => {
            options.replacement(item).forEach(id => {
                carry[id] = buildFor === item
            })
            return carry;
        }, {});
        replace = replacePlugin({
            values: replacements,
        });
    }

    return [{
        name: 'vite:multi-device',
        enforce: 'pre',
        configResolved,
        resolveId (id) {
            const filePath = idToFilePath(id, config.root);
            if (filePath) {
                const deviceFilePath = options.resolvePath(filePath, buildFor);
                if (fs.existsSync(deviceFilePath)) {
                    debug(`switch id: "${id}" -> "${deviceFilePath}"`);
                    return deviceFilePath;
                }
            }
        },
        transform (code: string, id: string, ssr?: boolean) {
            const newCode = replace.transform && replace.transform.call(this, code, id);
            if (newCode) debug('transforming: ' + id);
            return newCode;
        },
    }];
}
