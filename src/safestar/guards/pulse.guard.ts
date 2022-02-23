import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Pulses } from '../models/pulse.model';



export async function PulseExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const pulse_id = parseInt(request.params.pulse_id, 10);
  const pulse_model = await Pulses.findOne({
    where: { id: pulse_id }
  });
  if (!pulse_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Pulse not found`
    });
  }
  response.locals.pulse_model = pulse_model;
  return next();
}
export async function IsPulseOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const pulse_model = response.locals.pulse_model;
  if (!pulse_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Pulse not found`
    });
  }
  const isNotOwner = parseInt(pulse_model.get('owner_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the pulse owner`
    });
  }

  return next();
}
export async function IsNotPulseOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const pulse_model = response.locals.pulse_model;
  if (!pulse_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Pulse not found`
    });
  }
  const isOwner = parseInt(pulse_model.get('owner_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action for pulse they own`
    });
  }

  return next();
}
  