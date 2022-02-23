import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';
import { PhotoPulsesService } from '../services/photo-pulses.service';



export class PhotoPulsesRequestHandler {
  @CatchRequestHandlerError()
  static async get_photo_pulse_by_id(request: Request, response: Response): ExpressResponse {
    const photo_pulse_id: number = parseInt(request.params.photo_pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_photo_pulse_by_id(photo_pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_recent_photo_pulses(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_recent_photo_pulses(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_photo_pulses_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_user_photo_pulses_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_photo_pulses_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_user_photo_pulses_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_photo_pulses(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const photo_pulse_id: number = parseInt(request.params.photo_pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_user_photo_pulses(user_id, photo_pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_photo_pulse_messages_all(request: Request, response: Response): ExpressResponse {
    const photo_pulse_id: number = parseInt(request.params.user_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_photo_pulse_messages_all(photo_pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_photo_pulse_messages(request: Request, response: Response): ExpressResponse {
    const photo_pulse_id: number = parseInt(request.params.photo_pulse_id, 10);
    const photo_pulse_message_id: number = parseInt(request.params.photo_pulse_message_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.get_photo_pulse_messages(photo_pulse_id, photo_pulse_message_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_photo_pulse(request: Request, response: Response): ExpressResponse {
    const opts = {
      owner_id: response.locals.you!.id as number,
      code: request.body.code as string,
      lat: request.body.lat as number,
      lng: request.body.lng as number,
      pulse_image: request.files && (<UploadedFile> request.files.pulse_image)
    };
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.create_photo_pulse(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_photo_pulse_message(request: Request, response: Response): ExpressResponse {
    const opts = {
      owner_id: response.locals.you!.id as number,
      photo_pulse_id: parseInt(request.params.photo_pulse_id, 10) as number,
      body: request.body.body as string,
    };
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.create_photo_pulse_message(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_photo_pulse_as_sent_in_error(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const photo_pulse_id: number = parseInt(request.params.photo_pulse_id, 10);
    const serviceMethodResults: ServiceMethodResults = await PhotoPulsesService.mark_photo_pulse_as_sent_in_error(you.id, photo_pulse_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
  