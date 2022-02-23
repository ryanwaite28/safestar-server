import { Request, Response } from 'express';
import { ExpressResponse, ServiceMethodResults } from '../types/safestar.types';
import { CatchRequestHandlerError } from '../decorators/common.decorator';
import { TrackingsService } from '../services/trackings.service';


export class TrackingsRequestHandler {
  @CatchRequestHandlerError()
  static async check_user_tracking(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.check_user_tracking(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async check_user_tracking_request(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.check_user_tracking_request(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async request_track_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.request_track_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async cancel_request_track_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.cancel_request_track_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async reject_request_track_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.reject_request_track_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async accept_request_track_user(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.accept_request_track_user(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async stop_tracking(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.stop_tracking(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async stop_tracker(request: Request, response: Response): ExpressResponse {
    const you_id: number = parseInt(request.params.you_id, 10);
    const user_id: number = parseInt(request.params.user_id, 10);

    const serviceMethodResults: ServiceMethodResults = await TrackingsService.stop_tracker(you_id, user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackers_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackers_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackings_count(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackings_count(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackers_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackers_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackings_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackings_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackers(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackers(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_trackings(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_trackings(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }



  @CatchRequestHandlerError()
  static async get_user_tracker_requests_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracker_requests_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracking_requests_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracking_requests_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracker_requests(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracker_requests(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracking_requests(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracking_requests(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracker_requests_pending_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracker_requests_pending_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracking_requests_pending_all(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracking_requests_pending_all(user_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracker_requests_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracker_requests_pending(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }

  @CatchRequestHandlerError()
  static async get_user_tracking_requests_pending(request: Request, response: Response): ExpressResponse {
    const user_id: number = parseInt(request.params.user_id, 10);
    const tracking_id: number = parseInt(request.params.tracking_id, 10);
    
    const serviceMethodResults: ServiceMethodResults = await TrackingsService.get_user_tracking_requests_pending(user_id, tracking_id);
    return response.status(serviceMethodResults.status).json(serviceMethodResults.info);
  }
}