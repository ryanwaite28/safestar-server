import { Router, Request, Response } from 'express';
import { YouAuthorizedSlim } from '../guards/user.guard';
import { CheckpointsRequestHandler } from '../handlers/checkpoints.handler';
import { ConversationsRequestHandler } from '../handlers/conversations.handler';
import { PulsesRequestHandler } from '../handlers/pulses.handler';
import { UsersRequestHandler } from '../handlers/users.handler';
import { WatchesRequestHandler } from '../handlers/watches.handler';

export const BrowseRouter: Router = Router({ mergeParams: true });
  


BrowseRouter.get('/users-recent', YouAuthorizedSlim, UsersRequestHandler.get_recent_users);
BrowseRouter.get('/conversations-recent', YouAuthorizedSlim, ConversationsRequestHandler.get_recent_conversations);
BrowseRouter.get('/pulses-recent', YouAuthorizedSlim, PulsesRequestHandler.get_recent_pulses);
BrowseRouter.get('/checkpoints-recent', YouAuthorizedSlim, CheckpointsRequestHandler.get_recent_checkpoints);
BrowseRouter.get('/watches-recent', YouAuthorizedSlim, WatchesRequestHandler.get_recent_watches);