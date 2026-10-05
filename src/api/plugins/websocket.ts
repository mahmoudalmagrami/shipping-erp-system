import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fp from 'fastify-plugin';
import type { WebSocket } from 'ws';

async function websocketPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyWebsocket);

  const clients = new Set<WebSocket>();

  fastify.register(async function (instance) {
    instance.get('/ws', { websocket: true }, (connection, _req) => {
      const socket = (connection as any)?.socket ?? (connection as unknown as WebSocket);
      clients.add(socket);

      socket.on('close', () => {
        clients.delete(socket);
      });
    });
  });

  fastify.decorate('broadcastUpdate', (type: string, data: unknown) => {
    const payload = JSON.stringify({ type, data });
    for (const client of clients) {
      if (client.readyState === 1) { // OPEN
        client.send(payload);
      }
    }
  });
}

export default fp(websocketPlugin);

declare module 'fastify' {
  interface FastifyInstance {
    broadcastUpdate: (type: string, data: unknown) => void;
  }
}
