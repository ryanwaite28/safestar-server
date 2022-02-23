import { Router, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import { corsMiddleware } from './safestar.chamber';
import { UsersRouter } from './routers/users.router';
import { InfoRouter } from './routers/info.router';
import { UtilsRouter } from './routers/utils.router';
import { FindRouter } from './routers/find.router';
import { BrowseRouter } from './routers/browse.router';
import { PulsesRouter } from './routers/pulses.router';
import { PhotoPulsesRouter } from './routers/photo-pulses.router';
import { WatchesRouter } from './routers/watches.router';
import { CheckpointsRouter } from './routers/checkpoints.router';
import { TrackingsRouter } from './routers/trackings.router';
import { ConversationsRouter } from './routers/conversations.router';



// web

export const WebRouter: Router = Router();
WebRouter.use(bodyParser.json());
WebRouter.use(bodyParser.urlencoded({ extended: false }));
WebRouter.options(`*`, corsMiddleware);



WebRouter.use('/info', corsMiddleware, InfoRouter);
WebRouter.use('/utils', corsMiddleware, UtilsRouter);
WebRouter.use(`/users`, corsMiddleware, UsersRouter);

WebRouter.use(`/conversations`, corsMiddleware, ConversationsRouter);

WebRouter.use(`/pulses`, corsMiddleware, PulsesRouter);
WebRouter.use(`/photo-pulses`, corsMiddleware, PhotoPulsesRouter);
WebRouter.use(`/watches`, corsMiddleware, WatchesRouter);
WebRouter.use(`/checkpoints`, corsMiddleware, CheckpointsRouter);
WebRouter.use(`/trackings`, corsMiddleware, TrackingsRouter);

WebRouter.use(`/find`, corsMiddleware, FindRouter);
WebRouter.use(`/browse`, corsMiddleware, BrowseRouter);




// mobile

export const MobileRouter: Router = Router();
MobileRouter.use(bodyParser.json());
MobileRouter.use(bodyParser.urlencoded({ extended: false }));



MobileRouter.use('/info', InfoRouter);
MobileRouter.use('/utils', UtilsRouter);
MobileRouter.use(`/users`, UsersRouter);

MobileRouter.use(`/conversations`, ConversationsRouter);

MobileRouter.use(`/pulses`, PulsesRouter);
MobileRouter.use(`/photo-pulses`, PhotoPulsesRouter);
MobileRouter.use(`/watches`, WatchesRouter);
MobileRouter.use(`/checkpoints`, CheckpointsRouter);
MobileRouter.use(`/trackings`, TrackingsRouter);

MobileRouter.use(`/find`, FindRouter);
MobileRouter.use(`/browse`, BrowseRouter);
