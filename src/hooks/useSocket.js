import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, joinRoom, onEvent, offEvent, emitEvent } from '../utils/socket';

export const useSocket = (clientName = null) => {
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = connectSocket();

    if (clientName) {
      // Wait for connection before joining
      const socket = socketRef.current;
      
      if (socket.connected) {
        joinRoom(clientName);
      } else {
        socket.on('connect', () => {
          joinRoom(clientName);
        });
      }
    }

    return () => {
      // Don't disconnect, just cleanup
    };
  }, [clientName]);

  const on = (eventName, callback) => {
    onEvent(eventName, callback);
  };

  const off = (eventName, callback) => {
    offEvent(eventName, callback);
  };

  const emit = (eventName, data) => {
    emitEvent(eventName, data);
  };

  return { on, off, emit };
};
