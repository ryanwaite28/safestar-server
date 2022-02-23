import {
  fn,
  Op,
} from 'sequelize';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/safestar.types';
import { HttpStatusCode } from '../enums/http-codes.enum';
import { EVENT_TYPES } from '../enums/safestar.enum';
import { PlainObject } from '../interfaces/safestar.interface';
import { Messages, Messagings } from '../models/message.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../safestar.chamber';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { SocketsService } from './sockets.service';



export class MessagesService {
  static async get_user_messages(opts: {
    you_id: number,
    user_id: number,
    min_id: number,
  }): ServiceMethodAsyncResults {
    let { you_id, user_id, min_id } = opts;

    if (!user_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is required`
        }
      };
      return serviceMethodResults;
    }
    if (user_id === you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is invalid: cannot be same as you_id`
        }
      };
    }

    const whereClause: PlainObject = {
      [Op.or]: [
        { from_id: you_id, to_id: user_id },
        { from_id: user_id, to_id: you_id },
      ]
    };
    if (min_id) {
      whereClause.id = { [Op.lt]: min_id };
    }

    // console.log(whereClause);

    const messages_models = await Messages.findAll({
      where: whereClause,
      include: [{
        model: Users,
        as: 'from',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'to',
        attributes: user_attrs_slim
      }],
      limit: 5,
      order: [['id', 'DESC']]
    });

    // to avoid race condition, wait a little to mark messages as opened
    // UI relies on that flag being false when loading
    setTimeout(() => {
      console.log(`marking messages as opened 3 seconds later...`);
      for (const message_model of messages_models) {
        // only mark messages as opened if you were the user and not the sender
        const from_id = message_model.get('from_id');
        if (you_id === from_id || (<boolean> message_model.get('opened'))) {
          continue;
        }
        message_model.update({ opened: true }, { fields: ['opened'] })
          .then(() => {
            console.log(`marked message as opened = true`);
          })
          .catch((error: any) => {
            console.log(`could not mark messages as opened = true`, '\n\n', error, message_model);
          });
      }
    }, 3000);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: messages_models
      }
    };
    return serviceMethodResults;
  }

  static async send_user_message(opts: {
    you_id: number,
    user_id: number,
    body: string,
  }): ServiceMethodAsyncResults {
    let { you_id, user_id, body } = opts;

    if (!user_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is required`
        }
      };
      return serviceMethodResults;
    }
    if (user_id === you_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `user_id is invalid: cannot be same as you_id`
        }
      };
      return serviceMethodResults;
    }
    
    if (!body || !body.trim()) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Body cannot be empty`
        }
      };
      return serviceMethodResults;
    }

    // check if there was messaging between the two users
    let messaging_model = await Messagings.findOne({
      where: {
        [Op.or]: [
          { user_id: you_id, sender_id: user_id },
          { user_id: user_id, sender_id: you_id },
        ]
      }
    });

    if (!messaging_model) {
      // keep track that there was messaging between the two users
      messaging_model = await Messagings.create({
        user_id: user_id,
        sender_id: you_id
      });
    }

    // create the new message
    const new_message_model = await Messages.create({
      body,
      from_id: you_id,
      to_id: user_id,
    });

    const new_message = await Messages.findOne({
      where: { id: <number> new_message_model.get('id') },
      include: [{
        model: Users,
        as: 'from',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'to',
        attributes: user_attrs_slim
      }]
    });

    // there is an existing messaging, update the last updated
    const updates = await messaging_model.update({ updated_at: fn('NOW') }, { fields: ['updated_at'] })

    const get_messaging_model = await Messagings.findOne({
      where: { id: <number> messaging_model.get('id') },
      include: [{
        model: Users,
        as: 'sender',
        attributes: user_attrs_slim
      }, {
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    });

    const eventData = {
      event: EVENT_TYPES.NEW_MESSAGE,
      data: new_message!.toJSON() as any,
      messaging: get_messaging_model!.toJSON() as any,
      from_user_id: you_id,
      to_user_id: user_id,
    }
    const TO_ROOM = `${EVENT_TYPES.TO_MESSAGING_ROOM}:${eventData.messaging.id}`;
    console.log({ TO_ROOM, eventData });
    SocketsService.get_io().to(TO_ROOM).emit(TO_ROOM, eventData);
    
    CommonSocketEventsHandler.emitEventToUserSockets({
      user_id: user_id,
      event: EVENT_TYPES.NEW_MESSAGE,
      data: eventData,
    });

    // create_notification({
    //   from_id: you_id,
    //   to_id: user_id,
    //   event: EVENT_TYPES.NEW_MESSAGE,
    //   target_type: NOTIFICATION_TARGET_TYPES.MESSAGING,
    //   target_id: messaging_model.get('id')
    // }).then(async (notification_model) => {
    //   const notification = await populate_notification_obj(notification_model);
      
    // });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Message sent successfully!`,
        data: {
          new_message,
          updates
        },
      }
    };
    return serviceMethodResults;
  }

  static async mark_message_as_read(you_id: number, message_id: number): ServiceMethodAsyncResults {
    const updates = await Messages.update({ opened: true }, {
      where: { id: message_id, to_id: you_id }
    });

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `marked as read`,
        data: {
          updates,
        }
      }
    };
    return serviceMethodResults;
  }
}