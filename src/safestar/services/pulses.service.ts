import {
  HttpStatusCode
} from '../enums/http-codes.enum';
import {
  fn,
  Op,
  col,
  cast
} from 'sequelize';
import { Model } from 'sequelize/types';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { ServiceMethodAsyncResults, ServiceMethodResults } from '../types/safestar.types';
import { IPulse, IPulseMessage } from '../interfaces/pulse.interface';
import {
  get_pulse_by_id,
  get_recent_pulses,
  get_user_pulses_count,
  get_user_pulses_all,
  get_user_pulses,
  get_pulse_messages_all,
  get_pulse_messages,
  create_pulse,
  create_pulse_message,
  mark_pulse_as_sent_in_error,
} from '../repos/pulses.repo';
import { create_pulse_required_props, create_pulse_message_required_props, validateData, populate_notification_obj, validatePhone } from '../safestar.chamber';
import { EVENT_TYPES, NOTIFICATION_TARGET_TYPES, PULSE_CODES } from '../enums/safestar.enum';
import { TrackingsService } from './trackings.service';
import { find_users_within_radius_of_point } from '../repos/users.repo';
import { create_notification } from '../repos/notifications.repo';
import { CommonSocketEventsHandler } from './common.socket-event-handler';
import { GoogleService } from './google.service';
import { send_sms } from '../../sms-client';



export class PulsesService {
  static async get_pulse_by_id(pulse_id: number) {
    const pulse: IPulse | null = await get_pulse_by_id(pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulse,
      }
    };
    return serviceMethodResults;
  }

  static async get_recent_pulses(owner_id: number) {
    const pulses: IPulse[] = await get_recent_pulses(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_pulses_count(owner_id: number) {
    const pulsesCount: number = await get_user_pulses_count(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulsesCount,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_pulses_all(owner_id: number) {
    const pulses: IPulse[] = await get_user_pulses_all(owner_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_user_pulses(owner_id: number, pulse_id: number) {
    const pulses: IPulse[] = await get_user_pulses(owner_id, pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulses,
      }
    };
    return serviceMethodResults;
  }

  static async get_pulse_messages_all(pulse_id: number) {
    const pulseMessages: IPulseMessage[] = await get_pulse_messages_all(pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulseMessages,
      }
    };
    return serviceMethodResults;
  }

  static async get_pulse_messages(pulse_id: number, pulse_message_id: number) {
    const pulseMessages: IPulseMessage[] = await get_pulse_messages(pulse_id, pulse_message_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulseMessages,
      }
    };
    return serviceMethodResults;
  }

  static async create_pulse(params: {
    lat: number,
    lng: number,
    code: string,
    owner: IUser
  }) {
    const data = {
      lat: params.lat,
      lng: params.lng,
      owner_id: params.owner.id,
      code: params.code as PULSE_CODES,
    };

    const dataValidation = validateData({
      data, 
      validators: create_pulse_required_props,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    
    const pulse: IPulse = await create_pulse(data);

    /*
      async/background task:

      notify all users that are tracking this user or are with 10 miles of pulse location
    */

    const notify = async () => {
      const user_trackers = await TrackingsService.get_user_trackers_all(params.owner.id);
      find_users_within_radius_of_point(params.lat, params.lat, params.owner.id)
        .then((local_users) => {
          console.log({local_users});
          const use_local_users = local_users;
          // const use_local_users = local_users.filter(user => (<any> user).distance <= 10);

          const usersMap: PlainObject<IUser> = {};

          user_trackers.info.data!.forEach(tracker => {
            usersMap[tracker.user_id] = tracker.user!;
          });
          use_local_users.forEach(user => {
            usersMap[user.id] = user;
          });

          const user_ids_from_trackers = user_trackers.info.data!.map(tracker => tracker.user_id);
          const user_ids_from_local_users = use_local_users.map(user => user.id);
          const userIdsSet = new Set<number>([ ...user_ids_from_trackers, ...user_ids_from_local_users ]);

          console.log(userIdsSet, usersMap);
          
          for (const user of Object.values(usersMap)) {
            // create notification, send socket event and send push notification
            create_notification({
              from_id: params.owner.id,
              to_id: user.id,
              event: EVENT_TYPES.NEW_PULSE,
              target_type: NOTIFICATION_TARGET_TYPES.PULSE,
              target_id: pulse.id
            }).then((notification_model: Model) => {
              populate_notification_obj(notification_model).then((notification) => {
                CommonSocketEventsHandler.emitEventToUserSockets({
                  user_id: user.id,
                  event: EVENT_TYPES.NEW_PULSE,
                  data: {
                    notification,
                    pulse,
                  },
                });

                // send text
                if (!!user.phone && validatePhone(user.phone)) {
                  GoogleService.getLocationFromCoordinates(pulse.lat, pulse.lng)
                    .then((data) => {
                      const msg = `SafeStar: ${notification.message}\n\n` +
                      `User's number: ${params.owner.phone}\n\n` +
                      `User's Location: ${data.place.formatted_address}\n\n${data.placeData.city}, ${data.placeData.state} ` +
                        `${data.placeData.county ? '(' + data.placeData.county + ')' : ''} ${data.placeData.zipcode}`;
                      console.log(`sending:`, msg);
                      
                      send_sms({
                        to_phone_number: user.phone,
                        message: msg,
                      })
                    })
                    .catch((error) => {
                      console.log(`Can't send sms with location; sending without...`);
                      const msg = `SafeStar: ${notification.message}"\n\n`;
                      console.log(`sending:`, msg);
                      
                      send_sms({
                        to_phone_number: user.phone,
                        message: msg,
                      })
                    });
                }
              });
            });
          }
        }).catch((error) => {
          console.error(error);
        });
    };

    notify();

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Pulse created successfully!`,
        data: pulse,
      }
    };
    return serviceMethodResults;
  }

  static async create_pulse_message(params: {
    body: string,
    owner_id: number,
    pulse_id: number,
  }) {
    const dataValidation = validateData({
      data: params, 
      validators: create_pulse_message_required_props,
    });
    if (dataValidation.error) {
      return dataValidation;
    }
    
    const pulseMessage: IPulseMessage = await create_pulse_message(params);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        data: pulseMessage,
      }
    };
    return serviceMethodResults;
  }

  static async mark_pulse_as_sent_in_error(owner_id: number, pulse_id: number) {
    const pulse = await get_pulse_by_id(pulse_id);
    if (!pulse) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.NOT_FOUND,
        error: true,
        info: {
          message: `Pulse not found`
        }
      };
      return serviceMethodResults;
    }
    if (pulse.owner_id !== owner_id) {
      const serviceMethodResults: ServiceMethodResults = {
        status: HttpStatusCode.BAD_REQUEST,
        error: true,
        info: {
          message: `Not pulse owner`
        }
      };
      return serviceMethodResults;
    }
    
    const updates = await mark_pulse_as_sent_in_error(pulse_id);

    const serviceMethodResults: ServiceMethodResults = {
      status: HttpStatusCode.OK,
      error: false,
      info: {
        message: `Pulse updated successfully`,
        data: updates,
      }
    };
    return serviceMethodResults;
  }
}
  