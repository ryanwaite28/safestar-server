import { Router } from 'express';
import { YouAuthorized } from '../guards/user.guard';
import { PhotoPulsesRequestHandler } from '../handlers/photo-pulses.handler';

export const PhotoPulsesRouter: Router = Router({ mergeParams: true });
  


PhotoPulsesRouter.get('/:photo_pulse_id', PhotoPulsesRequestHandler.get_photo_pulse_by_id);
PhotoPulsesRouter.get('/:user_id/photo-pulses-count', PhotoPulsesRequestHandler.get_user_photo_pulses_count);

PhotoPulsesRouter.get('/:user_id/get-photo-pulses/all', PhotoPulsesRequestHandler.get_user_photo_pulses_all);
PhotoPulsesRouter.get('/:user_id/get-photo-pulses', PhotoPulsesRequestHandler.get_user_photo_pulses);
PhotoPulsesRouter.get('/:user_id/get-photo-pulses/:photo_pulse_id', PhotoPulsesRequestHandler.get_user_photo_pulses);

PhotoPulsesRouter.get('/:photo_pulse_id/get-photo-pulse-messages/all', PhotoPulsesRequestHandler.get_photo_pulse_messages_all);
PhotoPulsesRouter.get('/:photo_pulse_id/get-photo-pulse-messages', PhotoPulsesRequestHandler.get_photo_pulse_messages);
PhotoPulsesRouter.get('/:photo_pulse_id/get-photo-pulse-messages/:photo_pulse_message_id', PhotoPulsesRequestHandler.get_photo_pulse_messages);



PhotoPulsesRouter.post('/:you_id/create-photo-pulse', YouAuthorized, PhotoPulsesRequestHandler.create_photo_pulse);
PhotoPulsesRouter.post('/:you_id/create-photo-pulse-message/:photo_pulse_id', YouAuthorized, PhotoPulsesRequestHandler.create_photo_pulse_message);
PhotoPulsesRouter.post('/:you_id/mark-as-sent-in-error/:photo_pulse_id', YouAuthorized, PhotoPulsesRequestHandler.mark_photo_pulse_as_sent_in_error);
