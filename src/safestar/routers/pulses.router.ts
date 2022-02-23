import { Router } from 'express';
import { YouAuthorized } from '../guards/user.guard';
import { PulsesRequestHandler } from '../handlers/pulses.handler';

export const PulsesRouter: Router = Router({ mergeParams: true });
  


PulsesRouter.get('/:pulse_id', PulsesRequestHandler.get_pulse_by_id);
PulsesRouter.get('/:user_id/pulses-count', PulsesRequestHandler.get_user_pulses_count);

PulsesRouter.get('/:user_id/get-pulses/all', PulsesRequestHandler.get_user_pulses_all);
PulsesRouter.get('/:user_id/get-pulses', PulsesRequestHandler.get_user_pulses);
PulsesRouter.get('/:user_id/get-pulses/:pulse_id', PulsesRequestHandler.get_user_pulses);

PulsesRouter.get('/:pulse_id/get-pulse-messages/all', PulsesRequestHandler.get_pulse_messages_all);
PulsesRouter.get('/:pulse_id/get-pulse-messages', PulsesRequestHandler.get_pulse_messages);
PulsesRouter.get('/:pulse_id/get-pulse-messages/:pulse_message_id', PulsesRequestHandler.get_pulse_messages);



PulsesRouter.post('/:you_id/create-pulse', YouAuthorized, PulsesRequestHandler.create_pulse);
PulsesRouter.post('/:you_id/create-pulse-message/:pulse_id', YouAuthorized, PulsesRequestHandler.create_pulse_message);
PulsesRouter.post('/:you_id/mark-as-sent-in-error/:pulse_id', YouAuthorized, PulsesRequestHandler.mark_pulse_as_sent_in_error);
