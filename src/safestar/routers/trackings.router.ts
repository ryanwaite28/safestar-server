import { Router, Request, Response } from 'express';
import { UserIdsAreDifferent, YouAuthorized } from '../guards/user.guard';
import { TrackingsRequestHandler } from '../handlers/trackings.handler';

export const TrackingsRouter: Router = Router({ mergeParams: true });
  


TrackingsRouter.get('/:user_id/trackers-count', TrackingsRequestHandler.get_user_trackers_count);
TrackingsRouter.get('/:user_id/trackings-count', TrackingsRequestHandler.get_user_trackings_count);
TrackingsRouter.get('/:you_id/tracking/:user_id', UserIdsAreDifferent, TrackingsRequestHandler.check_user_tracking);
TrackingsRouter.get('/:you_id/tracking-request/:user_id', UserIdsAreDifferent, TrackingsRequestHandler.check_user_tracking_request);

TrackingsRouter.get('/:user_id/get-trackers/all', TrackingsRequestHandler.get_user_trackers_all);
TrackingsRouter.get('/:user_id/get-trackers', TrackingsRequestHandler.get_user_trackers);
TrackingsRouter.get('/:user_id/get-trackers/:tracking_id', TrackingsRequestHandler.get_user_trackers);

TrackingsRouter.get('/:user_id/get-trackings/all', TrackingsRequestHandler.get_user_trackings_all);
TrackingsRouter.get('/:user_id/get-trackings', TrackingsRequestHandler.get_user_trackings);
TrackingsRouter.get('/:user_id/get-trackings/:tracking_id', TrackingsRequestHandler.get_user_trackings);

TrackingsRouter.get('/:user_id/get-tracker-requests/all', TrackingsRequestHandler.get_user_tracker_requests_all);
TrackingsRouter.get('/:user_id/get-tracker-requests', TrackingsRequestHandler.get_user_tracker_requests);
TrackingsRouter.get('/:user_id/get-tracker-requests/:tracking_id', TrackingsRequestHandler.get_user_tracker_requests);

TrackingsRouter.get('/:user_id/get-tracking-requests/all', TrackingsRequestHandler.get_user_tracking_requests_all);
TrackingsRouter.get('/:user_id/get-tracking-requests', TrackingsRequestHandler.get_user_tracking_requests);
TrackingsRouter.get('/:user_id/get-tracking-requests/:tracking_id', TrackingsRequestHandler.get_user_tracking_requests);

TrackingsRouter.get('/:user_id/get-tracker-requests-pending/all', TrackingsRequestHandler.get_user_tracker_requests_pending_all);
TrackingsRouter.get('/:user_id/get-tracker-requests-pending', TrackingsRequestHandler.get_user_tracker_requests_pending);
TrackingsRouter.get('/:user_id/get-tracker-requests-pending/:tracking_id', TrackingsRequestHandler.get_user_tracker_requests_pending);

TrackingsRouter.get('/:user_id/get-tracking-requests-pending/all', TrackingsRequestHandler.get_user_tracking_requests_pending_all);
TrackingsRouter.get('/:user_id/get-tracking-requests-pending', TrackingsRequestHandler.get_user_tracking_requests_pending);
TrackingsRouter.get('/:user_id/get-tracking-requests-pending/:tracking_id', TrackingsRequestHandler.get_user_tracking_requests_pending);



TrackingsRouter.post('/:you_id/request-tracking/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.request_track_user);
TrackingsRouter.post('/:you_id/cancel-request-tracking/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.cancel_request_track_user);
TrackingsRouter.post('/:you_id/reject-request-tracking/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.reject_request_track_user);
TrackingsRouter.post('/:you_id/accept-request-tracking/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.accept_request_track_user);



TrackingsRouter.delete('/:you_id/stop-tracking/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.stop_tracking);
TrackingsRouter.delete('/:you_id/stop-tracker/:user_id', YouAuthorized, UserIdsAreDifferent, TrackingsRequestHandler.stop_tracker);