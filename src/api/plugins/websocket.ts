import type { FastifyInstance } from 'fastify';
import fastifyWebsocket from '@fastify/websocket';
import fp from 'fastify-plugin';
import type { WebSocket } from 'ws';

import { AuthService } from '../../domain/services/AuthService.js';

async function websocketPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyWebsocket);

  const clients = new Set<WebSocket>();

  fastify.register(async function (instance) {
    instance.get('/ws', { websocket: true }, async (connection, req) => {
      const socket = (connection as any)?.socket ?? (connection as unknown as WebSocket);

      try {
        const query = req.query as Record<string, string> | undefined;
        const rawToken = query?.token || 
          (req.headers['sec-websocket-protocol'] as string) || 
          (req.headers.authorization?.replace(/^Bearer\s+/i, ''));

        if (!rawToken) {
          socket.close(4001, 'Unauthorized');
          return;
        }

        const payload = await AuthService.verifyToken(rawToken);
        if (!payload) {
          socket.close(4001, 'Invalid token');
          return;
        }

        clients.add(socket);

        socket.on('close', () => {
          clients.delete(socket);
        });
      } catch (err) {
        socket.close(4001, 'Auth error');
      }
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
