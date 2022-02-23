import socket_io from 'socket.io';
import { whitelist_domains } from '../safestar.chamber';
import { CommonSocketEventsHandler } from './common.socket-event-handler';


export class SocketsService {
  /** Main state for app speific handlers */
  private static io: socket_io.Server;
  private static io_namespace: socket_io.Namespace;

  private static socketsByUserIdMap = new Map<number, Set<string>>();
  private static userSocketsRoomKeyByUserId = new Map<number, string>(); // all sockets belonging to a user via room key
  // private static socketsBySocketIdMap = new Map<string, socket_io.Socket>();
  // private static userSocketIDsByUserId = new Map<number, Map<string, boolean>>(); // all sockets belonging to a user via socket ids map

  public static set_io(io: socket_io.Server) {
    SocketsService.io = io;
  }

  public static get_io(): socket_io.Server {
    return SocketsService.io;
  }
  

  /* Template method for socekt event handler

  private static func(
    io: socket_io.Server,
    socket: socket_io.Socket,
    data: any,
    socketsByUserIdMap: Map<number, Map<string, socket_io.Socket>>,
    userSocketsRoomKeyByUserId: Map<number, string>,
  ) {

  }

  */



  /** Handle io.on('connect') event */

  public static handle_io_connections(io: socket_io.Server) {
    if (SocketsService.io) {
      // already handling
      return;
    }

    SocketsService.io = io;

    SocketsService.io_namespace = io.on('connection', (socket: socket_io.Socket) => {
      const originIsAllowed = whitelist_domains.includes(socket.handshake.headers.origin);
      if (!originIsAllowed) {
        console.log(`origin "${socket.handshake.headers.origin}" is not allowed`);
        return;
      }
      console.log(`socket origin (${socket.handshake.headers.origin}) is valid; listening to socket events...`);

      console.log('new socket:', socket.id, '\n');
      // io.to(socket_id).emit(`socket_id`, socket_id);
      
      /** Pass io, socket and state to each handler for app specific events */

      CommonSocketEventsHandler.handleNewSocket(io, socket, SocketsService.socketsByUserIdMap, SocketsService.userSocketsRoomKeyByUserId);
    
      /** end */
    });
  }

}
