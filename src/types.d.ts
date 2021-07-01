import 'express'

declare global {
    namespace Express {
        export interface Request {
            device?: string;
        }
    }

    export interface Window {
        DEVICE: { mobile: string; desktop: string; }
    }
}
