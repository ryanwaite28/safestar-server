import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { Conversations } from '../models/conversation.model';



export async function ConversationExists(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const conversation_id = parseInt(request.params.conversation_id, 10);
  const conversation_model = await Conversations.findOne({
    where: { id: conversation_id }
  });
  if (!conversation_model) {
    return response.status(HttpStatusCode.NOT_FOUND).json({
      message: `Conversation not found`
    });
  }
  response.locals.conversation_model = conversation_model;
  return next();
}
export async function IsConversationOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const conversation_model = response.locals.conversation_model;
  if (!conversation_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Conversation not found`
    });
  }
  const isNotOwner = parseInt(conversation_model.get('owner_id'), 10) !== you_id;
  if (isNotOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `You are not the conversation owner`
    });
  }

  return next();
}
export async function IsNotConversationOwner(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const you_id = parseInt(request.params.you_id, 10);
  const conversation_model = response.locals.conversation_model;
  if (!conversation_model) {
    return response.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
      message: `Conversation not found`
    });
  }
  const isOwner = parseInt(conversation_model.get('owner_id'), 10) === you_id;
  if (isOwner) {
    return response.status(HttpStatusCode.FORBIDDEN).json({
      message: `User cannot perform action for conversation they own`
    });
  }

  return next();
}