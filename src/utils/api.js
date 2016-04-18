/**
 * Determine API support
 */
export function listenSupported() {
    return chrome.sockets && chrome.sockets.tcpServer;
}

export function clientSocketSupported() {
    return chrome.sockets && chrome.sockets.tcp;
}

export function getNetworkInterfacesSupported() {
    return chrome.system && chrome.system.network;
}