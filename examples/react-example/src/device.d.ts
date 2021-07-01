export {}

declare global {
    interface Window {
        DEVICE: { desktop: string; mobile: string }
    }
}
