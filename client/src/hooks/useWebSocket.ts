import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';

export const useWebSocket = () => {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const token = useAuthStore(s => s.token);

  useEffect(() => {
    if (!isAuthenticated) return;

    let ws: WebSocket | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let isClosedManually = false;

    const connect = () => {
      const activeToken = token || sessionStorage.getItem('token');
      if (!activeToken) return;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws?token=${encodeURIComponent(activeToken)}`;

      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const knownEvents = [
            'REFRESH',
            'order_created',
            'order_dispatched',
            'order_cancelled',
            'voucher_created',
            'data_seeded'
          ];
          if (knownEvents.includes(data.type)) {
            queryClient.invalidateQueries();
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      ws.onclose = () => {
        if (!isClosedManually) {
          timeout = setTimeout(connect, 3000);
        }
      };
    };

    connect();

    return () => {
      isClosedManually = true;
      if (timeout) clearTimeout(timeout);
      if (ws) {
        ws.close();
      }
    };
  }, [isAuthenticated, token, queryClient]);
};
