
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import * as path from 'path';
import socket_io from 'socket.io';
import { ExpressPeerServer } from 'peer';
import * as http from 'http';

// @ts-ignore
import express_device from 'express-device';
import express_fileupload from 'express-fileupload';
import * as body_parser from 'body-parser';
import * as cookie_parser from 'cookie-parser';
import { installExpressApp } from './template-engine';
import { db_init } from './db-init';
import { v1 as uuidv1 } from 'uuid';
import { IRequest } from './safestar/interfaces/safestar.interface';
import { SocketsService } from './safestar/services/sockets.service';
import { WebRouter, MobileRouter } from './safestar/safestar.router';



/** Setup */

const PORT: string | number = process.env.PORT || 6700;
const app: express.Application = express();

installExpressApp(app);

app.use(express_fileupload({ safeFileNames: true, preserveExtension: true }));
app.use(express_device.capture());
app.use(cookie_parser.default());
app.use(body_parser.urlencoded({ extended: false }));

app.set('trust proxy', true);

const server: http.Server = http.createServer(app);
const io: socket_io.Server = socket_io(server);
io.engine.generateId = (req) => {
  return uuidv1(); // must be unique across all Socket.IO servers
};

SocketsService.handle_io_connections(io);

app.use((
  request: express.Request, 
  response: express.Response, 
  next: express.NextFunction
) => {
  (<IRequest> request).io = io;
  (<IRequest> request).socketsService = SocketsService;
  next();
});

const peerServer = ExpressPeerServer(server, {
  // debug: true,
  path: '/modern-peer'
});
app.use('/peerjs', peerServer);



/** Mount Sub-Routers to Master Application Instance */

app.use('/web', WebRouter);
app.use('/mobile', MobileRouter);



/** Static file declaration */

const publicPath = path.join(__dirname, '../_public');
const expressStaticPublicPath = express.static(publicPath);
app.use(expressStaticPublicPath);

/** init database */
console.log(`PORT = ${PORT}\n`);
console.log(`Connecting to database...\n`);
try {
  db_init().then(() => {
    console.log(`app db ready; starting app.`);
  
    /** Start Server */
    server.listen(PORT);
    console.log(`Listening on port ${PORT}...\n\n`);

    // open tunnel
    
    // (async () => {
    //   if (process.env.NODE_ENV === 'production') {
    //     return;
    //   }

    //   console.log(`attempting to open localtunnel on port ${PORT}...`);
      
    //   const localtunnel = require('localtunnel');
    //   const tunnel = await localtunnel({ port: PORT });
      
    //   // the assigned public url for your tunnel
    //   // i.e. https://abcdefgjhij.localtunnel.me
    //   console.log(`localtunnel url: `, tunnel.url);

    //   tunnel.on('request', (info: any) => {
    //     console.log(`localtunnel request...`, info);
    //   });

    //   tunnel.on('error', (err: any) => {
    //     console.log(`localtunnel error...`, err);
    //   });
      
    //   tunnel.on('close', () => {
    //     console.log(`localtunnel closed...`);
    //   });
    // })();
  });  
} catch (error) {
  console.log(`db_init error...`, { error });
  throw error;
}