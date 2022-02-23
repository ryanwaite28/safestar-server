import { Router, Request, Response } from 'express';
import { UserIdsAreDifferent, YouAuthorized } from '../guards/user.guard';
import { CheckpointsRequestHandler } from '../handlers/checkpoints.handler';

export const CheckpointsRouter: Router = Router({ mergeParams: true });
  


CheckpointsRouter.get('/:checkpoint_id', CheckpointsRequestHandler.get_checkpoint_by_id);
CheckpointsRouter.get('/:you_id/checkpoint-pending/:user_id', UserIdsAreDifferent, CheckpointsRequestHandler.check_user_to_user_checkpoint_pending);
CheckpointsRouter.get('/:you_id/checkpoints-sent/:user_id', UserIdsAreDifferent, CheckpointsRequestHandler.get_user_to_user_checkpoints);

CheckpointsRouter.get('/:user_id/get-checkpoints-sent/all', CheckpointsRequestHandler.get_user_checkpoints_sent_all);
CheckpointsRouter.get('/:user_id/get-checkpoints-sent', CheckpointsRequestHandler.get_user_checkpoints_sent);
CheckpointsRouter.get('/:user_id/get-checkpoints-sent/:checkpoint_id', CheckpointsRequestHandler.get_user_checkpoints_sent);

CheckpointsRouter.get('/:user_id/get-checkpoints-received/all', CheckpointsRequestHandler.get_user_checkpoints_received_all);
CheckpointsRouter.get('/:user_id/get-checkpoints-received', CheckpointsRequestHandler.get_user_checkpoints_received);
CheckpointsRouter.get('/:user_id/get-checkpoints-received/:checkpoint_id', CheckpointsRequestHandler.get_user_checkpoints_received);

CheckpointsRouter.get('/:user_id/get-checkpoints-sent-pending/all', CheckpointsRequestHandler.get_user_checkpoints_sent_all_pending);
CheckpointsRouter.get('/:user_id/get-checkpoints-sent-pending', CheckpointsRequestHandler.get_user_checkpoints_sent_pending);
CheckpointsRouter.get('/:user_id/get-checkpoints-sent-pending/:checkpoint_id', CheckpointsRequestHandler.get_user_checkpoints_sent_pending);

CheckpointsRouter.get('/:user_id/get-checkpoints-received-pending/all', CheckpointsRequestHandler.get_user_checkpoints_received_all_pending);
CheckpointsRouter.get('/:user_id/get-checkpoints-received-pending', CheckpointsRequestHandler.get_user_checkpoints_received_pending);
CheckpointsRouter.get('/:user_id/get-checkpoints-received-pending/:checkpoint_id', CheckpointsRequestHandler.get_user_checkpoints_received_pending);



CheckpointsRouter.post('/:you_id/checkpoint/:user_id', YouAuthorized, UserIdsAreDifferent, CheckpointsRequestHandler.create_send_user_checkpoint);
CheckpointsRouter.put('/:you_id/checkpoint-respond/:user_id', YouAuthorized, UserIdsAreDifferent, CheckpointsRequestHandler.respond_to_user_checkpoint_pending);