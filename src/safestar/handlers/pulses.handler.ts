import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';
import { PulsesService } from '../services/pulses.service';



export class PulsesRequestHandler {
  @CatchRequestHandlerError()
  static async get_pulse_by_id(request: Request, response: Response): ExpressResponse {
    const pulse_id: number = parseInt(request.params.pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_pulse_by_id(pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_recent_pulses(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_recent_pulses(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_pulses_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_user_pulses_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_pulses_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_user_pulses_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_pulses(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const pulse_id: number = parseInt(request.params.pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_user_pulses(user_id, pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_pulse_messages_all(request: Request, response: Response): ExpressResponse {
    const pulse_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_pulse_messages_all(pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_pulse_messages(request: Request, response: Response): ExpressResponse {
    const pulse_id: number = parseInt(request.params.pulse_id, 10);
    const pulse_message_id: number = parseInt(request.params.pulse_message_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.get_pulse_messages(pulse_id, pulse_message_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_pulse(request: Request, response: Response): ExpressResponse {
    const opts = {
      owner: response.locals.you! as IUser,
      code: request.body.code as string,
      lat: request.body.lat as number,
      lng: request.body.lng as number,
    };
    const serviceMethodResults: ServiceMethodResults = await PulsesService.create_pulse(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_pulse_message(request: Request, response: Response): ExpressResponse {
    const opts = {
      owner_id: response.locals.you!.id as number,
      pulse_id: parseInt(request.params.pulse_id, 10) as number,
      body: request.body.body as string,
    };
    const serviceMethodResults: ServiceMethodResults = await PulsesService.create_pulse_message(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_pulse_as_sent_in_error(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const pulse_id: number = parseInt(request.params.pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PulsesService.mark_pulse_as_sent_in_error(you.id, pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
  