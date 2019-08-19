
export function isRunningInOpenFin() {
    return typeof window.fin !== 'undefined';
}