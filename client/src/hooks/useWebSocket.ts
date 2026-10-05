import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ws: WebSocket;
    let timeout: ReturnType<typeof setTimeout>;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'REFRESH') {
            queryClient.invalidateQueries();
          }
        } catch (e) {}
      };

      ws.onclose = () => {
        timeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(timeout);
      if (ws) ws.close();
    };
  }, [isAuthenticated, queryClient]);
};
