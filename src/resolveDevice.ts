import { IncomingMessage } from 'http';

const cache = new Map<string, string>();

export type DevicesMap = Record<string, RegExp | boolean | ((req: IncomingMessage) => boolean)>

export function resolveDevice (req: IncomingMessage, devices: DevicesMap): string | undefined {
    const userAgent = req.headers['user-agent'] || '';

    const cached = cache.get(userAgent);
    if (cached) {
        return cached;
    }

    const result = Object.keys(devices).find(device => {
        const re = devices[device];

        if (typeof re === 'boolean') {
            return re;
        }
        if (typeof re === 'function') {
            return re(req);
        }

        return re.test(userAgent);
    });

    if (result) cache.set(userAgent, result);

    return result;
}
