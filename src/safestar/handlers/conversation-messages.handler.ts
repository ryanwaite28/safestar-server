import { Request, Response } from 'express';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { ConversationMessagesService } from '../services/conversation-messages.service';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';



export class ConversationMessagesRequestHandler {
  
  @CatchRequestHandlerError()
  static async get_conversation_messages(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const message_id = parseInt(request.params.message_id, 10);

    const serviceMethodResults: ServiceMethodResults = await ConversationMessagesService.get_conversation_messages({ you_id, conversation_id, message_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_conversation_last_opened(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await ConversationMessagesService.update_conversation_last_opened({ you_id, conversation_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async create_conversation_message(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const body = request.body.body && request.body.body.trim();
    const parent_message_id = request.body.parent_message_id || null;
    const opts = { you_id, conversation_id, body, parent_message_id };

    const serviceMethodResults: ServiceMethodResults = await ConversationMessagesService.create_conversation_message(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_message_as_seen(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const message_id = parseInt(request.params.message_id, 10);
    const conversation_id = parseInt(request.params.conversation_id, 10);
    const opts = { you_id, message_id, conversation_id };
    
    const serviceMethodResults: ServiceMethodResults = await ConversationMessagesService.mark_message_as_seen(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}