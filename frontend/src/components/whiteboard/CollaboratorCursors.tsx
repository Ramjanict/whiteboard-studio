'use client';

import React from 'react';
import { CollaboratorCursor } from '@/hooks/useCollaboration';
import { CanvasAppState } from '@/types/whiteboard';
import { MousePointer2 } from 'lucide-react';

interface CollaboratorCursorsProps {
  collaborators: CollaboratorCursor[];
  appState: CanvasAppState;
}

export const CollaboratorCursors: React.FC<CollaboratorCursorsProps> = ({
  collaborators,
  appState,
}) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
      {collaborators.map((c) => {
        // Project world coordinate into screen coordinate
        const screenX = c.x * appState.zoom + appState.scrollX;
        const screenY = c.y * appState.zoom + appState.scrollY;

        return (
          <div
            key={c.socketId}
            className="absolute top-0 left-0 transition-transform duration-75 ease-out will-change-transform flex items-start"
            style={{
              transform: `translate3d(${screenX}px, ${screenY}px, 0)`,
            }}
          >
            <MousePointer2
              className="w-5 h-5 -rotate-90 drop-shadow-md"
              style={{
                fill: c.userColor,
                color: c.userColor,
              }}
            />
            <span
              className="ml-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-sm whitespace-nowrap"
              style={{ backgroundColor: c.userColor }}
            >
              {c.userName}
            </span>
          </div>
        );
      })}
    </div>
  );
};
