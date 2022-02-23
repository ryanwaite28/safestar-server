import {
  fn,
  Op,
  where,
  col,
  literal,
} from 'sequelize';
import { Model } from 'sequelize/types';
import { create_notification } from '../repos/notifications.repo';
import { Users } from '../models/user.model';
import { SocketsService } from './sockets.service';
import {
  find_or_create_conversation_member,
  get_conversation_members,
  get_conversation_members_all,
  get_conversation_member_by_user_id_and_conversation_id,
  remove_conversation_member
} from '../repos/conversation-members.repo';
import { find_or_create_user_conversation_last_opened, get_conversation_by_id } from '../repos/conversations.repo';
import { create_conversation_message } from '../repos/conversation-messages.repo';
import { ServiceMethodResults } from '../types/safestar.types';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES, STATUSES } from '../enums/safestar.enum';
import { PlainObject, IUser } from '../interfaces/safestar.interface';
import { ConversationMembers, ConversationMemberRequests, Conversations } from '../models/conversation.model';
import { populate_notification_obj, getUserFullName, user_attrs_slim } from '../safestar.chamber';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { get_user_by_id } from '../repos/users.repo';
import { IConversation } from '../interfaces/conversation.interface';



export class ConversationMembersService {
  static async get_conversation_members_all(conversation_id: number) {
    const members_models = await get_conversation_members_all(conversation_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async get_conversation_members(conversation_id: number, member_id?: number) {
    const members_models = await get_conversation_members(conversation_id, member_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: members_models
      }
    };
    return serviceMethodResults;
  }

  static async check_conversation_member(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;
    const results = await get_conversation_member_by_user_id_and_conversation_id(you_id, conversation_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: results
      }
    };
    return serviceMethodResults;
  }

  static async check_conversation_member_request(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;
    const check_member_request = await ConversationMemberRequests.findOne({
      where: {
        conversation_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async send_member_request(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;
    const check_member_request = await ConversationMemberRequests.findOne({
      where: {
        conversation_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });
    if (check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You already sent a member request to this conversation`
        }
      };
      return serviceMethodResults;
    }

    const member_request = await ConversationMemberRequests.create({
      conversation_id,
      user_id: you_id,
      status: STATUSES.PENDING,
    });

    // don't block via await
    get_conversation_by_id(conversation_id).then((conversation: IConversation | null) => {
      create_notification({
        from_id: you_id,
        to_id: conversation!.owner_id,
        event: EVENT_TYPES.CONVERSATION_MEMBER_REQUESTED,
        target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
        target_id: conversation_id
      }).then((notification_model: Model) => {
        populate_notification_obj(notification_model).then((notification) => {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: conversation!.owner_id,
            event: EVENT_TYPES.CONVERSATION_MEMBER_REQUESTED,
            data: {
              conversation,
              notification
            },
          });
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request sent!`,
        data: member_request
      }
    };
    return serviceMethodResults;
  }

  static async cancel_member_request(opts: {
    you_id: number,
    conversation_id: number,
  }) {
    const { you_id, conversation_id } = opts;
    const check_member_request = await ConversationMemberRequests.findOne({
      where: {
        conversation_id,
        user_id: you_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `You did not send a member request to this conversation`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.CANCEL }, { fields: ['status'] });

    // don't block via await
    get_conversation_by_id(conversation_id).then((conversation: IConversation | null) => {
      create_notification({
        from_id: you_id,
        to_id: conversation!.owner_id,
        event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_CANCELED,
        target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
        target_id: conversation_id
      }).then((notification_model: Model) => {
        populate_notification_obj(notification_model).then((notification) => {
          CommonSocketEventsHandler.emitEventToUserSockets({
            user_id: conversation!.owner_id,
            event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_CANCELED,
            data: {
              notification
            },
          });
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request canceled!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async accept_member_request(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;
    const check_member_request = await ConversationMemberRequests.findOne({
      where: {
        conversation_id,
        user_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No member request found for this conversation`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.ACCEPT }, { fields: ['status'] });

    await ConversationMembersService.add_conversation_member(opts);

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_ACCEPTED,
      target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_ACCEPTED,
          data: {
            notification
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request accepted!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async reject_member_request(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;
    const check_member_request = await ConversationMemberRequests.findOne({
      where: {
        conversation_id,
        user_id,
        status: STATUSES.PENDING,
      }
    });
    if (!check_member_request) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `No member request found for this conversation`
        }
      };
      return serviceMethodResults;
    }

    await check_member_request.update({ status: STATUSES.REJECT }, { fields: ['status'] });
    
    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_REJECTED,
      target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.CONVERSATION_MEMBER_REQUEST_REJECTED,
          data: {
            notification
          },
        });
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: true,
      info: {
        message: `Member request rejected!`,
        data: check_member_request
      }
    };
    return serviceMethodResults;
  }

  static async add_conversation_member(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;

    const member_model = await get_conversation_member_by_user_id_and_conversation_id(user_id, conversation_id);
    if (member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is already a member`
        }
      };
      return serviceMethodResults;
    }

    // get all the conversations that the user is a part of via when they last opened it
    const new_conversation_member_model = await find_or_create_conversation_member(user_id, conversation_id);
    const new_conversation_last_opened_model = await find_or_create_user_conversation_last_opened(user_id, conversation_id);

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(
      EVENT_TYPES.CONVERSATION_MEMBER_ADDED, 
      {
        event: EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
        data: {
          // conversation: response.locals.conversation_model!.toJSON(),
          member: new_conversation_member_model.toJSON()
        },
      }
    );

    // don't block via await
    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
      target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.CONVERSATION_MEMBER_ADDED,
          data: {
            notification
          },
        });
      });
    });
    
    const full_name = getUserFullName((<PlainObject> new_conversation_member_model.toJSON()).user);
    const body: string = `${full_name} was added to the conversation.`;
    create_conversation_message(conversation_id, body)
      .then((message_model: Model) => {
        SocketsService.get_io().to(`conversation-${conversation_id}`).emit(EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
          event: EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
          data: message_model!.toJSON(),
        });
      });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: new_conversation_member_model,
        message: `Conversation member added!`
      }
    };
    return serviceMethodResults;
  }

  static async remove_conversation_member(opts: {
    you_id: number,
    user_id: number,
    conversation_id: number,
  }) {
    const { you_id, user_id, conversation_id } = opts;

    const member_model = await get_conversation_member_by_user_id_and_conversation_id(user_id, conversation_id);

    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user is not a member`
        }
      };
      return serviceMethodResults;
    }
    
    const memberObj: PlainObject = member_model.toJSON();
    const deletes = await member_model.destroy();

    SocketsService.get_io().to(`conversation-${conversation_id}`).emit(EVENT_TYPES.CONVERSATION_MEMBER_REMOVED, {
      event: EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
      data: { conversation_id, user_id, member: memberObj },
    });

    create_notification({
      from_id: you_id,
      to_id: user_id,
      event: EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
      target_type: NOTIFICATION_TARGET_TYPES.CONVERSATION,
      target_id: conversation_id
    }).then((notification_model: Model) => {
      populate_notification_obj(notification_model).then((notification) => {
        CommonSocketEventsHandler.emitEventToUserSockets({
          user_id,
          event: EVENT_TYPES.CONVERSATION_MEMBER_REMOVED,
          data: {
            notification
          },
        });
      });
    });

    const full_name = getUserFullName(memberObj.user);
    const body: string = `${full_name} was removed from the conversation.`;

    create_conversation_message(conversation_id, body).then((message_model: Model) => {
      SocketsService.get_io().to(`conversation-${conversation_id}`).emit(EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event: EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: message_model!.toJSON(),
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Conversation member removed!`
      }
    };
    return serviceMethodResults;
  }

  static async leave_conversation(you_id: number, conversation_id: number) {
    const member_model = await get_conversation_member_by_user_id_and_conversation_id(you_id, conversation_id);
    if (!member_model) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `you are not a member`
        }
      };
      return serviceMethodResults;
    }

    const deletes = await member_model.destroy();
    const roomKey = `conversation-${conversation_id}`;

    const user_model = await get_user_by_id(you_id);
    const user = <IUser> user_model!;
    const full_name = getUserFullName(user);
    const body: string = `${full_name} left the conversation.`;

    create_conversation_message(conversation_id, body).then((message_model: Model) => {
      SocketsService.get_io().to(roomKey).emit(EVENT_TYPES.CONVERSATION_MEMBER_LEFT, {
        event: EVENT_TYPES.CONVERSATION_MEMBER_LEFT,
        data: {
          conversation_id,
          user_id: you_id,
          user: user,
        },
      });

      SocketsService.get_io().to(roomKey).emit(EVENT_TYPES.NEW_CONVERSATION_MESSAGE, {
        event: EVENT_TYPES.NEW_CONVERSATION_MESSAGE,
        data: {
          message: message_model!.toJSON(),
        }
      });
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: deletes,
        message: `Left conversation!`
      }
    };
    return serviceMethodResults;
  }

  static async search_members(conversation_id: number, query: string) {
    let query_term = (<string> query || '').trim().toLowerCase();
    if (!query_term) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `query_term query param is required`
        }
      };
      return serviceMethodResults;
    }

    const member_ids_models = await ConversationMembers.findAll({
      where: { conversation_id },
      attributes: ['user_id']
    });
    const user_ids = member_ids_models.length ? member_ids_models.map((m: Model) => m.get('user_id')) : [];
    const results = await Users.findAll({
      where: {
        id: { [Op.notIn]: user_ids as number[] },
        allow_conversations: true,
        [Op.or]: [{
          firstname: where(fn('LOWER', col('firstname')), 'LIKE', '%' + query_term + '%'),
        }, {
          lastname: where(fn('LOWER', col('lastname')), 'LIKE', '%' + query_term + '%'),
        }]
      },
      attributes: [
        ...user_attrs_slim,
        [literal("firstname || ' ' || lastname"), 'full_name']
      ],
      limit: 10
    });

    const newList = [];
    for (const user_model of results) {
      // see if there is a pending request
      const user = <IUser> user_model.toJSON();
      if (user.is_public) {
        (<any> user).member_request = null;
        newList.push(user);
        continue;
      }
      const request_model = await ConversationMemberRequests.findOne({
        where: {
          conversation_id,
          user_id: user.id,
        }
      });
      (<any> user).member_request = request_model && request_model!.toJSON() || null;
      newList.push(user);
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList
      }
    };
    return serviceMethodResults;
  }
}