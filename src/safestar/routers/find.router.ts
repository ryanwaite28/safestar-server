import { Router, Request, Response } from 'express';
import { YouAuthorizedSlim } from '../guards/user.guard';
import { UsersRequestHandler } from '../handlers/users.handler';

export const FindRouter: Router = Router({ mergeParams: true });
  


FindRouter.get('/users/name', YouAuthorizedSlim, UsersRequestHandler.find_users_by_name);
FindRouter.get('/users/username', YouAuthorizedSlim, UsersRequestHandler.find_users_by_username);
FindRouter.get('/users/name-or-username', YouAuthorizedSlim, UsersRequestHandler.find_users_by_name_or_username);