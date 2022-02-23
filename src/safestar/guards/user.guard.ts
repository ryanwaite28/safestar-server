import { NextFunction, Request, Response } from 'express';
import { Users } from '../models/user.model';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { get_user_by_id } from '../repos/users.repo';
import { AuthorizeJWT, compareUserIdArgs, user_attrs_med } from '../safestar.chamber';
import { IUser } from '../interfaces/safestar.interface';



export async function YouExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const you_model = await get_user_by_id(you_id);
  if (!you_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `User does not exist by id: ${you_id}`
    });
  }
  response.locals.you_model = you_model;
  return next();
}

export async function UserExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const user_id = parseInt(request.params.user_id, 10);
  const user_model = await get_user_by_id(user_id);
  if (!user_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `User does not exist by id: ${user_id}`
    });
  }
  response.locals.user_model = user_model;
  response.locals.user = user_model;
  return next();
}

export function YouAuthorized(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, true);
  if (auth.error) {
    return response.status(auth.status).json(auth);
  }
  response.locals.you = auth.you;
  return next();
}
export function YouAuthorizedSlim(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, false);
  if (auth.error) {
    return response.status(auth.status).json(auth);
  }
  response.locals.you = auth.you;
  return next();
}
export function YouAuthorizedSlimWeak(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const auth = AuthorizeJWT(request, false);
  response.locals.you = auth.you;
  return next();
}

export function UserIdsAreDifferent(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const user_id = parseInt(request.params.user_id, 10);
  
  const compareResults = compareUserIdArgs(you_id, user_id);
  if (compareResults.error) {
    return response.status(compareResults.status).json(compareResults.info);
  }

  return next();
}

export async function UserIdsAreDifferentWithModel(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const user_id = parseInt(request.params.user_id, 10);
  
  const compareResults = compareUserIdArgs(you_id, user_id);
  if (compareResults.error) {
    return response.status(compareResults.status).json(compareResults.info);
  }

  const user_model = await Users.findOne({
    where: { id: user_id },
    attributes: user_attrs_med,
  });
  response.locals.user = user_model && user_model.toJSON();
  return next();
}
