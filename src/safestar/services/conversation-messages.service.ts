import {
  fn,
  Op,
} from 'sequelize';
import { Model } from 'sequelize/types';
import { ServiceMethodResults } from '../types/safestar.types';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { EVENT_TYPES } from '../enums/safestar.enum';
import { PlainObject } from '../interfaces/safestar.interface';
import { ConversationMembers, ConversationMessages, ConversationLastOpeneds, ConversationMessageSeens } from '../models/conversation.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../safestar.chamber';
import { SocketsService } from './sockets.service';

export class ConversationMessagesService {
  static async get_conversation_messages(opts: {
    you_id: number,
    conversation_id: number,
    message_id: number,
  }) {
    const { you_id, conversation_id, message_id } = opts;
    const conversation_member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this conversation`
        }
      };
      return serviceMethodResults;
    }

    const whereClause: PlainObject = { conversation_id };
    if (message_id) {
      whereClause.id = { [Op.lt]: message_id };
    }

    // get all the conversations that the user is a part of via when they last opened it
    const conversations_last_opened_models = await ConversationMessages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }],
      order: [['id', 'DESC']],
      limit: 5
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: conversations_last_opened_models
      }
    };
    return serviceMethodResults;
  }

  static async update_conversation_last_opened(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;

    console.log(`updating last opened for conversation`);
    const updates = await ConversationLastOpeneds.update({ last_opened: fn('NOW') }, {
      where: { conversation_id, user_id: you_id }
    });

    console.log({ updates, conversation_id, user_id: you_id });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `conversation last opened updated`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }

  static async create_conversation_message(opts: {
    you_id: number,
    conversation_id: number,
    parent_message_id: number,
    body: string,
  }) {
    let { you_id, conversation_id, parent_message_id, body } = opts;
    body = body && body.trim();

    const conversation_member_model = await ConversationMembers.findOne({
      where: { conversation_id, user_id: you_id }
    });

    if (!conversation_member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You are not a member of this conversation`
        }
      };
      return serviceMethodResults;
    }
    
    if (!body) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `message body cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_message_model = await ConversationMessages.create({
      conversation_id,
      parent_message_id,
      body,
      owner_id: you_id
    });

    const conversation_message_model = await ConversationMessages.findOne({
      where: { id: new_conversation_message_model.get('id') as number },
      include: [{
        model: Users,
        as: 'owner',
        attributes: user_attrs_slim
      }]
    });

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
      event: EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
      data: conversation_message_model!.toJSON(),
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `conversation message created!`,
        data: conversation_message_model
      }
    };
    return serviceMethodResults;
  }

  static async mark_message_as_seen(opts: {
    you_id: number,
    conversation_id: number,
    message_id: number,
  }) {
    const { you_id, conversation_id, message_id } = opts;

    let seen_message_model: Model | null = await ConversationMessageSeens.findOne({
      where: { conversation_id, message_id, user_id: you_id, seen: true }
    });
    if (seen_message_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.OK,
        error: false,
        info: {
          message: `message already seen`
        }
      };
      return serviceMethodResults;
    }
    seen_message_model = await ConversationMessageSeens.create({
      conversation_id, message_id, user_id: you_id, seen: true
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `message marked as seen`,
        data: seen_message_model
      }
    };
    return serviceMethodResults;
  }
}