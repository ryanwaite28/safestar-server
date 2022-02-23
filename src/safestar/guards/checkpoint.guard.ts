import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Checkpoints } from '../models/checkpoint.model';
import { get_checkpoint_by_id_model } from '../repos/checkpoints.repo';



export async function CheckpointExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const checkpoint_id = parseInt(request.params.checkpoint_id, 10);
  const checkpoint_model = await get_checkpoint_by_id_model(checkpoint_id);
  if (!checkpoint_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Checkpoint not found`
    });
  }
  response.locals.checkpoint_model = checkpoint_model;
  return next();
}
export async function IsCheckpointSender(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const checkpoint_model = response.locals.checkpoint_model;
  if (!checkpoint_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Checkpoint not found`
    });
  }
  const isNotSender = parseInt(checkpoint_model.get('user_id'), 10) !== you_id;
  if (isNotSender) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform this action for checkpoint they did not send`
    });
  }

  return next();
}
export async function IsNotCheckpointSender(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const checkpoint_model = response.locals.checkpoint_model;
  if (!checkpoint_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Checkpoint not found`
    });
  }
  const isSender = parseInt(checkpoint_model.get('user_id'), 10) === you_id;
  if (isSender) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform this action for checkpoint they sent`
    });
  }

  return next();
}
export async function IsCheckpointReceiver(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const checkpoint_model = response.locals.checkpoint_model;
  if (!checkpoint_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Checkpoint not found`
    });
  }
  const isNotReceiver = parseInt(checkpoint_model.get('check_id'), 10) !== you_id;
  if (isNotReceiver) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform this action for checkpoint they did not receive`
    });
  }

  return next();
}
export async function IsNotCheckpointReceiver(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const checkpoint_model = response.locals.checkpoint_model;
  if (!checkpoint_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Checkpoint not found`
    });
  }
  const isReceiver = parseInt(checkpoint_model.get('check_id'), 10) === you_id;
  if (isReceiver) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform this action for checkpoint they received`
    });
  }

  return next();
}