import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Watches } from '../models/watch.model';



export async function WatchExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const watch_id = parseInt(request.params.watch_id, 10);
  const watch_model = await Watches.findOne({
    where: { id: watch_id }
  });
  if (!watch_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Watch not found`
    });
  }
  response.locals.watch_model = watch_model;
  return next();
}
export async function IsWatchOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const watch_model = response.locals.watch_model;
  if (!watch_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Watch not found`
    });
  }
  const isNotOwner = parseInt(watch_model.get('owner_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the watch owner`
    });
  }

  return next();
}
export async function IsNotWatchOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const watch_model = response.locals.watch_model;
  if (!watch_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Watch not found`
    });
  }
  const isOwner = parseInt(watch_model.get('owner_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action for watch they own`
    });
  }

  return next();
}
  