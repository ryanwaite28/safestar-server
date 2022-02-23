import { fn } from 'sequelize';
import { ServiceMethodAsyncResults, ServiceMethodResults } from "../types/safestar.types";
import { HttpStatusCode } from "../enums/http-codes.enum";
import { Notifications, Users } from "../models/user.model";
import { paginateTable, getAll } from "../repos/_common.repo";
import { newUserJwtToken, populate_notification_obj } from "../safestar.chamber";



export class NotificationsService {
  // request handlers

  static async get_user_notifications(user_id: number, notification_id?: number): ServiceMethodAsyncResults {
    const notifications_models = await paginateTable(
      Notifications,
      'to_id',
      user_id,
      notification_id
    );

    const newList: any[] = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_notification_obj(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e);
        console.log({ notification: notification_model && notification_model.toJSON() });
        newList.push(notification_model?.toJSON());
      }
    }

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: newList.filter(i => !!i),
      }
    };
    return serviceMethodResults;
  }

  static async get_user_notifications_all(user_id: number): ServiceMethodAsyncResults {
    const notifications_models = await getAll(
      Notifications,
      'to_id',
      user_id,
    );
    
    const newList: any = [];
    for (const notification_model of notifications_models) {
      try {
        const notificationObj = await populate_notification_obj(notification_model);
        newList.push(notificationObj);
      } catch (e) {
        console.log(e, notification_model);
        newList.push(notification_model.toJSON());
      }
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

  static async update_user_last_opened(user_id: number): ServiceMethodAsyncResults {
    // update user last opened
    await Users.update(<any> { notifications_last_opened: fn('NOW') }, { where: { id: user_id } });
    const newYouModel = await Users.findOne({
      where: { id: user_id },
      attributes: { exclude: ['password'] }
    });

    const newYou = <any> newYouModel!.toJSON();
    // create new token and return
    const jwt = newUserJwtToken(newYou);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: {
          you: newYou,
          token: jwt
        }
      }
    };
    return serviceMethodResults;
  }
}