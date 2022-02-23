import { Request, Response } from 'express';
import { NotificationsService } from '../services/notifications.service';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { IUser } from '../interfaces/safestar.interface';



export class NotificationsRequestHandler {
  @CatchRequestHandlerError()
  static async get_user_notifications(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    const notification_id: number = parseInt(request.params.notification_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await NotificationsService.get_user_notifications(you.id, notification_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_notifications_all(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 

    const serviceMethodResults: ServiceMethodResults = await NotificationsService.get_user_notifications_all(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_user_last_opened(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you; 
    
    const serviceMethodResults: ServiceMethodResults = await NotificationsService.update_user_last_opened(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}