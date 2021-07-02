import { DevicesMap } from "./resolveDevice";
import path from "path";

const CONFIG_FILE = 'multidevice.config.js';

export type MultiDeviceConfig = {
    devices: string[] | DevicesMap;
    fallback: string;
    replacement: (device: string) => string | string[];
    resolvePath: (path: string, device: string) => string;
    env: 'DEVICE';
}

const defaultConfig: MultiDeviceConfig = {
    devices: {
        mobile: /Mobile|iP(hone|od|ad)|Android|BlackBerry|IEMobile|Kindle|NetFront|Silk-Accelerated|(hpw|web)OS|Fennec|Minimo|Opera M(obi|ini)|Blazer|Dolfin|Dolphin|Skyfire|Zune/,
    },
    fallback: 'desktop',
    replacement: (device: string): string | string[] => ['DEVICE.' + device, 'window.DEVICE.' + device],
    resolvePath: (path: string, device: string): string => path.replace(/\.([^?/\\]+)(\?.*)?$/, `.${device}.$1$2`),
    env: 'DEVICE'
};

export function loadConfig(): MultiDeviceConfig {
    let config: Partial<MultiDeviceConfig> = {};
    try {
        config = require(path.resolve(process.cwd(), CONFIG_FILE));
    } catch (err) {
        console.error(err);
    } // eslint-disable-line no-empty
    return {
        ...defaultConfig,
        ...config,
    };
}
