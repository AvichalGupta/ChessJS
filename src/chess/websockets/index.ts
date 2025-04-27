import WebSocket from 'ws';

export const websocketServer = new WebSocket.Server({ port: 8080 });