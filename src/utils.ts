import { resolve } from 'path';

export function idToFilePath (id: string, root: string): string | false {
    if (id[0] !== '/' || id[1] === '@') return false;

    const filePath = id.startsWith(root) ? id : resolve(root, id.slice(1).replace(/\?.+$/, ''));

    if (!filePath.match(/\.(.+)$/i)) { return false; }

    return filePath;
}

export function resolveDeviceFilePath (filePath: string, device: string): string {
    return filePath.replace(/\.([^\\/?]+)(\?.*)?$/, `.${device}.$1$2`);
}
