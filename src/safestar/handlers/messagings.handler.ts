import { Request, Response } from 'express';
import { MessagingsService } from '../services/messagings.service';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';



export class MessagingsRequestHandler {
  @CatchRequestHandlerError()
  static async get_user_messagings_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);

    const serviceMethodResults: ServiceMethodResults = await MessagingsService.get_user_messagings_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_messagings(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const messagings_timestamp: string = request.params.messagings_timestamp;

    const serviceMethodResults: ServiceMethodResults = await MessagingsService.get_user_messagings(you_id, messagings_timestamp);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}