import socket_io from 'socket.io';
import { EVENT_TYPES } from '../enums/safestar.enum';

export class CommonSocketEventsHandler {
  private static io: socket_io.Server;
  private static socketsByUserIdMap: Map<number, Set<string>>;
  private static userSocketsRoomKeyByUserId: Map<number, string>;

  public static handleNewSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ): void {
    CommonSocketEventsHandler.io = io;
    CommonSocketEventsHandler.socketsByUserIdMap = socketsByUserIdMap;
    CommonSocketEventsHandler.userSocketsRoomKeyByUserId = userSocketsRoomKeyByUserId;

    socket.on(`disconnect`, (data: any) => {
      console.log(`disconnecting socket ${socket.id}...`);
      CommonSocketEventsHandler.removeSocketBySocketId(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.SOCKET_JOIN_ROOM, (data: any) => {
      CommonSocketEventsHandler.SOCKET_JOIN_ROOM(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.SOCKET_LEAVE_ROOM, (data: any) => {
      CommonSocketEventsHandler.SOCKET_LEAVE_ROOM(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.JOIN_TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.JOIN_TO_MESSAGING_ROOM(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.LEAVE_TO_MESSAGING_ROOM(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.TO_MESSAGING_ROOM, (data: any) => {
      CommonSocketEventsHandler.TO_MESSAGING_ROOM(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    // socket.on(EVENT_TYPES.MESSAGE_TYPING, (data: any) => {
    //   CommonSocketEventsHandler.MESSAGE_TYPING(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    // });

    // socket.on(EVENT_TYPES.MESSAGE_TYPING_STOPPED, (data: any) => {
    //   CommonSocketEventsHandler.MESSAGE_TYPING_STOPPED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    // });

    socket.on(EVENT_TYPES.CONVERSATION_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_SUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.CONVERSATION_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_EVENTS_UNSUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, (data: any) => {
      CommonSocketEventsHandler.CONVERSATION_MESSAGE_TYPING_STOPPED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.SOCKET_TRACK, (data: any) => {
      CommonSocketEventsHandler.SOCKET_TRACK(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.MESSAGING_EVENTS_SUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_SUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED, (data: any) => {
      CommonSocketEventsHandler.MESSAGING_EVENTS_UNSUBSCRIBED(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });

    socket.on(EVENT_TYPES.SOCKET_TO_USER_EVENT, (data: any) => {
      CommonSocketEventsHandler.SOCKET_TO_USER_EVENT(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
    });
  }



  /** Helpers */

  private static SOCKET_JOIN_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    const validEventData = (
      data.hasOwnProperty('room') &&
      typeof(data.room) === 'string'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`ERROR`, {
        error: `${EVENT_TYPES.SOCKET_JOIN_ROOM}-error`,
        message: `room is required.`
      });
      return;
    }

    socket.join(data.room, (err: any) => {
      console.log(`socket ${socket.id} joined room ${data.room}. error:`, err);
      socket.to(socket.id).emit(EVENT_TYPES.SOCKET_JOIN_ROOM, { err, room: data.room });
    });
  }

  private static SOCKET_LEAVE_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    const validEventData = (
      data.hasOwnProperty('room') &&
      typeof(data.room) === 'string'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`ERROR`, {
        error: `${EVENT_TYPES.SOCKET_LEAVE_ROOM}-error`,
        message: `room is required.`
      });
      return;
    }

    socket.leave(data.room, (err: any) => {
      console.log(`socket ${socket.id} left room ${data.room}. error:`, err);
      socket.to(socket.id).emit(EVENT_TYPES.SOCKET_LEAVE_ROOM, { err, room: data.room });
    });
  }

  private static addUserSocket(
    io: socket_io.Server,
    socket: socket_io.Socket,
    user_id: number,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    // create room key for user so user can get events on all signed in devices
    let roomKey = userSocketsRoomKeyByUserId?.get(user_id);
    if (roomKey) {
      socket.join(roomKey, (err: any) => {
        console.log(`err`, err);
        console.log(`roomKey`, roomKey);
      });
    } 
    else {
      roomKey = Date.now().toString();
      userSocketsRoomKeyByUserId?.set(user_id, roomKey);
      socket.join(roomKey, (err: any) => {
        console.log(`err`, err);
        console.log(`roomKey`, roomKey);
      });
    }

    let socketIdsSet = socketsByUserIdMap.get(user_id);
    if (socketIdsSet) {
      socketIdsSet.add(socket.id);
    } else {
      socketIdsSet = new Set<string>();
      socketIdsSet.add(socket.id);
      socketsByUserIdMap.set(user_id, socketIdsSet);
    }

    console.log(
      `addUserSocket() - user id: ${user_id} - socket id: ${socket?.id} - CommonSocketEventsHandler.socketsByUserIdMap:`, 
      CommonSocketEventsHandler.socketsByUserIdMap.entries()
    );
    console.log(
      `addUserSocket() - user id: ${user_id} - socket id: ${socket?.id} - CommonSocketEventsHandler.userSocketsRoomKeyByUserId:`, 
      CommonSocketEventsHandler.userSocketsRoomKeyByUserId?.entries(),
      // Object.values(io.sockets.in(roomKey).sockets).map(socket => ({
      //   id: socket.id,
      //   rooms: socket.rooms
      // })),
    );
  }

  public static removeSocketBySocketId(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    socket.leaveAll();
    for (const keyVal of userSocketsRoomKeyByUserId?.entries()) {
      const userId = typeof (keyVal[0]) === 'object' ? (<any> keyVal[0]).user_id : keyVal[0];
      const roomKey = keyVal[1];
      console.log({keyVal});

      // const sockets_id_map = io.sockets.in(roomKey).sockets;
      // if (Object.keys(sockets_id_map).length === 0) {
      //   userSocketsRoomKeyByUserId?.delete(userId);
      // }

      const socketsByUserId = socketsByUserIdMap.get(userId);
      socketsByUserId?.delete(socket.id);

      // const isInRoom = (socket.id in sockets_id_map);
      // console.log({ socket_id: socket.id, roomKey, isInRoom });
      // if (isInRoom) {
      //   socket.leave(roomKey);
      // }

      console.log(
        `removeSocketBySocketId() - user id: ${userId} - socket id: ${socket?.id} - CommonSocketEventsHandler.socketsByUserIdMap:`, 
        CommonSocketEventsHandler.socketsByUserIdMap.entries(),
      );
      console.log(
        `removeSocketBySocketId() - user id: ${userId} - socket id: ${socket?.id} - CommonSocketEventsHandler.userSocketsRoomKeyByUserId:`, 
        CommonSocketEventsHandler.userSocketsRoomKeyByUserId?.entries()
      );
    }
  }

  static emitEventToUserSockets(params: {
    event: EVENT_TYPES;
    data: any;
    user_id: number;
  }) {
    // method 1
    let roomKey = CommonSocketEventsHandler.userSocketsRoomKeyByUserId?.get(params.user_id);
    if (!roomKey) {
      console.log(`CommonSocketEventsHandler.emitEventToUser - no roomKey by user Id`);
      return;
    }
    if (!('event' in params.data)) {
      params.data.event = params.event;
    }
    console.log(`Emitting ${params.event} event to user_id ${params.user_id}'s socket via room: ${roomKey}`);
    // console.log(`Emitting ${params.event} event to user_id ${params.user_id}'s socket via room: ${roomKey}`, params);
    CommonSocketEventsHandler.io.sockets.in(roomKey).emit(params.event, params.data);
    // CommonSocketEventsHandler.io.sockets.in(roomKey).emit(`FOR-USER:${params.user_id}`, params.data);



    // method 2
    // const socketsByUserId = CommonSocketEventsHandler.socketsByUserIdMap?.get(params.user_id);
    // socketsByUserId?.forEach((socket_id: string) => {
    //   console.log(`Emitting ${params.event} event to user_id ${params.user_id}'s socket via socket id: ${socket_id}`, params);
    //   CommonSocketEventsHandler.io.to(socket_id).emit(params.event, params.data);
    // });
  }

  public static emitUserToUserEvent(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>
  ) {
    const forUserSocketsRoomKey = userSocketsRoomKeyByUserId?.get(data.to_user_id);
    if (forUserSocketsRoomKey) {
      socket.to(forUserSocketsRoomKey).emit(data.event, data);
    }
  }

  // public static emitForUserEvent(
  //   io: socket_io.Server,
  //   socket: socket_io.Socket,
  //   data: any,
  //   socketsByUserIdMap: Map<number, Set<string>>,
  //   userSocketsRoomKeyByUserId: Map<number, string>
  // ) {
  //   const forUserSocketsMap = socketsByUserIdMap.get(data.for_user_id);
  //   if (forUserSocketsMap) {
  //     for (const for_socket of forUserSocketsMap.values()) {
  //       socket.to(for_socket.id).emit(`FOR-USER:${data.for_user_id}`, data);
  //     }
  //   }
  // }



  /** Handlers */

  private static JOIN_TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${EVENT_TYPES.JOIN_TO_MESSAGING_ROOM}-error`,
        message: `from_user_id and messaging_id is required.`
      });
      return;
    }

    data.event = EVENT_TYPES.JOIN_TO_MESSAGING_ROOM;
    const TO_ROOM = `${EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    socket.join(TO_ROOM, (err: any) => {
      console.log(err);
    });

    console.log(`--- socket ${socket.id} joined messaging room ${data.messaging_id}`);
    console.log({ TO_ROOM, data, sockets: Object.keys(io.in(TO_ROOM).sockets) });
    io.to(TO_ROOM).emit(EVENT_TYPES.JOIN_TO_MESSAGING_ROOM, data);
  }

  private static LEAVE_TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`ERROR`, {
        error: `${EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM}-error`,
        message: `from_user_id and messaging_id is required.`
      });
      return;
    }

    data.event = EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM;
    const TO_ROOM = `${EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    socket.leave(TO_ROOM, (err: any) => {
      console.log(err);
    });

    console.log(`--- socket ${socket.id} left messaging room ${data.messaging_id}`);
    console.log({ TO_ROOM, data, sockets: Object.keys(io.in(TO_ROOM).sockets) });
    io.to(TO_ROOM).emit(EVENT_TYPES.LEAVE_TO_MESSAGING_ROOM, data);
  }

  private static TO_MESSAGING_ROOM(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('from_user_id') &&
      typeof(data.from_user_id) === 'number' &&
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number' &&
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      console.log(`${EVENT_TYPES.MESSAGE_TYPING}-error`, data);
      socket.to(socket.id).emit(`ERROR`, {
        error: `${EVENT_TYPES.MESSAGE_TYPING}-error`,
        message: `from_user_id, to_user_id and messaging_id is required.`
      });
      return;
    }
    
    const TO_ROOM = `${EVENT_TYPES.TO_MESSAGING_ROOM}:${data.messaging_id}`;
    console.log({ TO_ROOM, data, sockets: Object.keys(io.in(TO_ROOM).sockets) });
    io.to(TO_ROOM).emit(TO_ROOM, data);
  }

  private static MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.MESSAGE_TYPING}-error`, { message: `to_user_id is required.` });
      return;
    }

    data.event = EVENT_TYPES.MESSAGE_TYPING;
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.MESSAGE_TYPING_STOPPED}-error`, { message: `to_user_id is required.` });
      return;
    }

    data.event = EVENT_TYPES.MESSAGE_TYPING_STOPPED;
    CommonSocketEventsHandler.emitUserToUserEvent(io, socket, data, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static CONVERSATION_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.CONVERSATION_EVENTS_SUBSCRIBED}-error`, { message: `conversation_id is required.` });
      return;
    }

    const roomKey = `conversation-${data.conversation_id}`;
    const sockets_id_map = io.in(roomKey).sockets;
    const notInRoom = !(socket.id in sockets_id_map);
    if (notInRoom) {
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    }
  }

  private static CONVERSATION_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.CONVERSATION_EVENTS_UNSUBSCRIBED}-error`, { message: `conversation_id is required.` });
      return;
    }

    const roomKey = `conversation-${data.conversation_id}`;
    socket.leave(roomKey, (err: any) => {
      console.log(err);
    });
  }

  private static CONVERSATION_MESSAGE_TYPING(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.CONVERSATION_MESSAGE_TYPING}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING, data);
  }

  private static CONVERSATION_MESSAGE_TYPING_STOPPED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('conversation_id') &&
      typeof(data.conversation_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED}-error`, { message: `conversation_id is required.` });
      return;
    }

    io.to(`conversation-${data.conversation_id}`).emit(EVENT_TYPES.CONVERSATION_MESSAGE_TYPING_STOPPED, data);
  }

  private static SOCKET_TRACK(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('user_id') &&
      typeof(data.user_id) === 'number'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`${EVENT_TYPES.SOCKET_TRACK}-error`, { message: `user_id is required.` });
      return;
    }

    CommonSocketEventsHandler.addUserSocket(io, socket, data.user_id, socketsByUserIdMap, userSocketsRoomKeyByUserId);
  }

  private static MESSAGING_EVENTS_SUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.MESSAGING_EVENTS_SUBSCRIBED}-error`, { message: `messaging_id is required.` });
      return;
    }

    const roomKey = `messaging-${data.messaging_id}`;
    const sockets_id_map = io.in(roomKey).sockets;
    const notInRoom = !(socket.id in sockets_id_map);
    if (notInRoom) {
      socket.join(roomKey, (err: any) => {
        console.log(err);
      });
    }
  }

  private static MESSAGING_EVENTS_UNSUBSCRIBED(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('messaging_id') &&
      typeof(data.messaging_id) === 'number'
    );
    if (!validEventData) {
      socket.to(socket.id).emit(`${EVENT_TYPES.MESSAGING_EVENTS_UNSUBSCRIBED}-error`, { message: `messaging_id is required.` });
      return;
    }

    const roomKey = `messaging-${data.messaging_id}`;
    socket.leave(roomKey);
  }

  private static SOCKET_TO_USER_EVENT(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Set<string>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {
    const validEventData = (
      data.hasOwnProperty('to_user_id') &&
      typeof(data.to_user_id) === 'number'
    );
    if (!validEventData) {
      io.to(socket.id).emit(`${EVENT_TYPES.SOCKET_TO_USER_EVENT}-error`, { message: `to_user_id is required.` });
      return;
    }

    const toUserSocketsMap = socketsByUserIdMap.get(data.to_user_id);
    if (toUserSocketsMap) {
      for (const to_socket_id of toUserSocketsMap.values()) {
        io.to(to_socket_id).emit(data.event, data);
      }
    }
  }
}