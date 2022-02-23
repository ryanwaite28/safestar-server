import { Request, Response } from 'express';
import { UploadedFile } from 'express-fileupload';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { IUser, IRequest, PlainObject } from '../interfaces/safestar.interface';
import { WatchesService } from '../services/watches.service';



export class WatchesRequestHandler {
  @CatchRequestHandlerError()
  static async get_recent_watches(request: Request, response: Response): ExpressResponse {
    const you: IUser = response.locals.you;
    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_recent_watches(you.id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  static async get_user_watches_all(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_user_watches_all(you_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_watches(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const watch_timestamp: string = request.params.watch_timestamp;
    const opts = { you_id, watch_timestamp };

    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_user_watches(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async create_watch(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const title: string = (request.body.title || '').trim();
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const coordinates = JSON.parse(request.body.coordinates) as {
      center: { lat: number, lng: number },
      northEast: { lat: number, lng: number },
      southWest: { lat: number, lng: number },
    };
    const opts = { you_id, title, icon_file, coordinates };
    console.log(`request body`, request.body);
    console.log(`opts`, opts);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.create_watch(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_watch(request: Request, response: Response): ExpressResponse {
    const icon_file: UploadedFile | undefined = request.files && (<UploadedFile> request.files.icon);
    const title: string = (request.body.title || '').trim();
    const watch_id: number = parseInt(request.params.watch_id, 10);
    const opts = { watch_id, title, icon_file };

    const serviceMethodResults: ServiceMethodResults = await WatchesService.update_watch(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async delete_watch(request: Request, response: Response): ExpressResponse {
    const watch_id: number = parseInt(request.params.watch_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.delete_watch(watch_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_watch_messages(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    const message_id = parseInt(request.params.message_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_watch_messages({ you_id, watch_id, message_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async update_watch_last_opened(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.update_watch_last_opened({ you_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async create_watch_message(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    const body = request.body.body && request.body.body.trim();
    const parent_message_id = request.body.parent_message_id || null;
    const opts = { you_id, watch_id, body, parent_message_id };

    const serviceMethodResults: ServiceMethodResults = await WatchesService.create_watch_message(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async mark_message_as_seen(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const message_id = parseInt(request.params.message_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    const opts = { you_id, message_id, watch_id };
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.mark_message_as_seen(opts);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_watch_members_all(request: Request, response: Response): ExpressResponse {
    const watch_id = parseInt(request.params.watch_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_watch_members_all(watch_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_watch_members(request: Request, response: Response): ExpressResponse {
    const watch_id = parseInt(request.params.watch_id, 10);
    const member_id = parseInt(request.params.member_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.get_watch_members(watch_id, member_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async add_watch_member(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.add_watch_member({ you_id, user_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async check_watch_member(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.check_watch_member({ you_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async check_watch_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.check_watch_member_request({ you_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async send_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.send_member_request({ you_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async cancel_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.cancel_member_request({ you_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
  
  @CatchRequestHandlerError()
  static async accept_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.accept_member_request({ you_id, user_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async reject_member_request(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.reject_member_request({ you_id, user_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async remove_watch_member(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const user_id = parseInt(request.params.user_id, 10);
    const watch_id = parseInt(request.params.watch_id, 10);

    const serviceMethodResults: ServiceMethodResults = await WatchesService.remove_watch_member({ you_id, user_id, watch_id });
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async leave_watch(request: Request, response: Response): ExpressResponse {
    const you_id = parseInt(request.params.you_id, 10);
    const watch_id = response.locals.watch_model.get('id');

    const serviceMethodResults: ServiceMethodResults = await WatchesService.leave_watch(you_id, watch_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async search_members(request: Request, response: Response): ExpressResponse {
    const watch_id = parseInt(request.params.watch_id, 10);
    const query_term = request.query.query_term as string;
    
    const serviceMethodResults: ServiceMethodResults = await WatchesService.search_members(watch_id, query_term);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}
  