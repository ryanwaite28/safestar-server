import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ConversationsService } from '../services/conversations.service';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { IUser } from '../interfaces/safestar.interface';



export class ConversationsRequestHandler {
  @CatchRequestHandlerError()
  static async get_user_conversations_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_conversations(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const conversation_timestamp: string = request.params.conversation_timestamp;
    const opts = { you_id, conversation_timestamp };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_user_conversations(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_recent_conversations(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.get_recent_conversations(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_conversation(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const title: string = (request.body.title || '').trim();
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const opts = { you_id, title, icon_file };
    console.log(`request body`, request.body);
    console.log(`opts`, opts);
    
    const serviceMethodResults: ServiceMethodResults = await ConversationsService.create_conversation(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_conversation(request: Request, response: Response): ExpressResponse {
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const title: string = (request.body.title || '').trim();
    const conversation_id: number = parseInt(request.params.conversation_id, 10);
    const opts = { conversation_id, title, icon_file };

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.update_conversation(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async delete_conversation(request: Request, response: Response): ExpressResponse {
    const conversation_id: number = parseInt(request.params.conversation_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationsService.delete_conversation(conversation_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}