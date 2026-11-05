'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { WhiteboardElement } from '@/types/whiteboard';
import { toast } from 'sonner';

export interface CollaboratorCursor {
  socketId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
}

const vibrantColors = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

export function useCollaboration(
  roomId: string = 'global',
  onRemoteElementUpdate?: (element: WhiteboardElement, action: 'create' | 'update' | 'delete') => void,
  onRemoteCanvasClear?: () => void,
) {
  const socketRef = useRef<Socket | null>(null);
  const [collaborators, setCollaborators] = useState<Map<string, CollaboratorCursor>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; color: string }>({
    id: '',
    name: 'Collaborator',
    color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
  });

  const lastCursorEmit = useRef<number>(0);

  useEffect(() => {
    // Generate persistent anonymous user credentials for session
    const storedName =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('whiteboard_username') || `User-${Math.floor(1000 + Math.random() * 9000)}`
        : 'User';
    const storedColor =
      typeof window !== 'undefined'
        ? sessionStorage.getItem('whiteboard_color') || vibrantColors[Math.floor(Math.random() * vibrantColors.length)]
        : '#3b82f6';

    const userId = `u-${Date.now()}`;
    setCurrentUser({ id: userId, name: storedName, color: storedColor });

    // Connect to WebSocket gateway
    const socketUrl =
      process.env.NEXT_PUBLIC_WS_URL ||
      'https://whiteboard-studio-c21b.onrender.com/collaboration';
    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', {
        roomId,
        userId,
        userName: storedName,
        userColor: storedColor,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-users', (users: any[]) => {
      const map = new Map<string, CollaboratorCursor>();
      users.forEach((u) => {
        if (u.socketId !== socket.id) {
          map.set(u.socketId, u);
        }
      });
      setCollaborators(map);
    });

    socket.on('user-joined', (user: CollaboratorCursor) => {
      if (user.socketId !== socket.id) {
        setCollaborators((prev) => {
          const next = new Map(prev);
          next.set(user.socketId, user);
          return next;
        });
        toast.info(`${user.userName} joined the session`);
      }
    });

    socket.on('user-left', (data: { socketId: string }) => {
      setCollaborators((prev) => {
        const next = new Map(prev);
        next.delete(data.socketId);
        return next;
      });
    });

    socket.on('cursor-moved', (cursor: CollaboratorCursor) => {
      setCollaborators((prev) => {
        const next = new Map(prev);
        next.set(cursor.socketId, cursor);
        return next;
      });
    });

    socket.on(
      'element-updated',
      (data: { element: WhiteboardElement; action: 'create' | 'update' | 'delete'; fromSocketId: string }) => {
        if (data.fromSocketId !== socket.id && onRemoteElementUpdate) {
          onRemoteElementUpdate(data.element, data.action);
        }
      },
    );

    socket.on('canvas-cleared', (data: { fromSocketId: string }) => {
      if (data.fromSocketId !== socket.id && onRemoteCanvasClear) {
        onRemoteCanvasClear();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, onRemoteElementUpdate, onRemoteCanvasClear]);

  // Throttled cursor position broadcast (60fps limit)
  const broadcastCursor = useCallback(
    (x: number, y: number) => {
      const now = Date.now();
      if (now - lastCursorEmit.current < 25) return; // 40Hz
      lastCursorEmit.current = now;

      if (socketRef.current?.connected) {
        socketRef.current.emit('cursor-move', { roomId, x, y });
      }
    },
    [roomId],
  );

  const broadcastElement = useCallback(
    (element: WhiteboardElement, action: 'create' | 'update' | 'delete') => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('element-update', { roomId, element, action });
      }
    },
    [roomId],
  );

  const broadcastClear = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('canvas-clear', { roomId });
    }
  }, [roomId]);

  return {
    collaborators: Array.from(collaborators.values()),
    isConnected,
    currentUser,
    broadcastCursor,
    broadcastElement,
    broadcastClear,
  };
}
