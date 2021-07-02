import { Plugin, ResolvedConfig } from 'vite';
import * as fs from 'fs';
import makeDebug from 'debug';
import replacePlugin from '@rollup/plugin-replace';
import { idToFilePath } from './utils';
import { getDevicesArray, loadConfig, MultiDeviceConfig } from "./config";

const debug = makeDebug('vite:multi-device');

export default function multiDevice (rawOptions?: Record<string, unknown>): Plugin[] {
    if (rawOptions) {
        console.warn('[vite-plugin-multi-device]: passing options to plugin constructor is deprecated, please create multidevice.config.js at root of your project.');
    }

    const options: MultiDeviceConfig = {
        ...loadConfig(),
        ...(rawOptions || {})
    };

    let replacements, buildFor, replace;
    let config: ResolvedConfig;

    function configResolved (_config: ResolvedConfig) {
        config = _config;

        buildFor = (config as any).__DEVICE || process.env[options.env];
        debug('building for "' + buildFor + '"');

        const devicesArray = getDevicesArray(options);
        if (!buildFor || !devicesArray.includes(buildFor)) {
            throw new Error('[vite-plugin-multi-device]: DEVICE is not specified or not listed in devices option: ' + buildFor);
        }

        replacements = devicesArray.reduce((carry, item) => {
            ([] as string[]).concat(options.replacement(item)).forEach(id => {
                carry[id] = buildFor === item;
            });
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
        transform (code: string, id: string) {
            const newCode = replace.transform && replace.transform.call(this, code, id);
            if (newCode) debug('transforming: ' + id);
            return newCode;
        },
    }];
}
