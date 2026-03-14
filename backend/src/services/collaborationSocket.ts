import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
  
// Colour palette for collaborator cursors
const COLOURS = [
  '#6C63FF', '#FF6584', '#43D9AD', '#FFD166',
  '#06CFA1', '#EF476F', '#118AB2', '#FFB400',
];

interface CollaboratorInfo {
  userId: string;
  email: string;
  color: string;
  cursor?: { x: number; y: number };
  activeSlideId?: string;
}

// In-memory room state:  roomId → { socketId → CollaboratorInfo }
const rooms = new Map<string, Map<string, CollaboratorInfo>>();

const getColor = (index: number) => COLOURS[index % COLOURS.length];

export const setupCollaborationSocket = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  const collab = io.of('/collab');

  // ── Authentication middleware ─────────────────────────────────────────────
  collab.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Authentication required'));
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      (socket as any).userId = payload.id;
      (socket as any).userEmail = payload.email;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  collab.on('connection', (socket: Socket) => {
    const userId: string = (socket as any).userId;
    const userEmail: string = (socket as any).userEmail;

    console.log(`[Collab] Connected: ${userEmail} (${socket.id})`);

    // ── join-room ────────────────────────────────────────────────────────────
    socket.on('join-room', (presentationId: string) => {
      socket.join(presentationId);

      if (!rooms.has(presentationId)) rooms.set(presentationId, new Map());
      const room = rooms.get(presentationId)!;

      const colorIdx = room.size;
      const info: CollaboratorInfo = {
        userId,
        email: userEmail,
        color: getColor(colorIdx),
      };
      room.set(socket.id, info);

      // Send current collaborators list to the joining user
      socket.emit('room-state', Array.from(room.entries()).map(([sid, c]) => ({
        socketId: sid,
        ...c,
      })));

      // Broadcast to others
      socket.to(presentationId).emit('user-joined', {
        socketId: socket.id,
        ...info,
      });

      console.log(`[Collab] ${userEmail} joined room ${presentationId}`);
    });

    // ── slide-update ─────────────────────────────────────────────────────────
    // event = { presentationId, type, payload }
    // type = 'update-block' | 'add-block' | 'delete-block' | 'add-slide' |
    //         'delete-slide' | 'reorder-slides' | 'update-background' |
    //         'update-title' | 'update-theme'
    socket.on('slide-update', (event: {
      presentationId: string;
      type: string;
      payload: any;
    }) => {
      // Broadcast to all OTHERS in the room
      socket.to(event.presentationId).emit('slide-update', {
        ...event,
        fromSocketId: socket.id,
        fromEmail: userEmail,
      });
    });

    // ── cursor-move ──────────────────────────────────────────────────────────
    socket.on('cursor-move', (data: {
      presentationId: string;
      x: number;
      y: number;
      activeSlideId: string;
    }) => {
      const room = rooms.get(data.presentationId);
      if (room?.has(socket.id)) {
        const info = room.get(socket.id)!;
        info.cursor = { x: data.x, y: data.y };
        info.activeSlideId = data.activeSlideId;
      }
      socket.to(data.presentationId).emit('cursor-move', {
        socketId: socket.id,
        x: data.x,
        y: data.y,
        activeSlideId: data.activeSlideId,
      });
    });

    // ── leave-room ───────────────────────────────────────────────────────────
    socket.on('leave-room', (presentationId: string) => {
      socket.leave(presentationId);
      rooms.get(presentationId)?.delete(socket.id);
      socket.to(presentationId).emit('user-left', { socketId: socket.id });
    });

    // ── disconnect ───────────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Collab] Disconnected: ${userEmail} (${socket.id})`);
      rooms.forEach((room, presentationId) => {
        if (room.has(socket.id)) {
          room.delete(socket.id);
          socket.to(presentationId).emit('user-left', { socketId: socket.id });
        }
      });
    });
  });

  return io;
};
