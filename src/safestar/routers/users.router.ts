import { Router, Request, Response } from 'express';
import { ConversationExists, IsConversationOwner, IsNotConversationOwner } from '../guards/conversation.guard';
import { UserIdsAreDifferent, YouAuthorized, YouAuthorizedSlim } from '../guards/user.guard';
import { IsNotWatchOwner, IsWatchOwner, WatchExists } from '../guards/watch.guard';
import { ConversationMembersRequestHandler } from '../handlers/conversation-members.handler';
import { ConversationMessagesRequestHandler } from '../handlers/conversation-messages.handler';
import { ConversationsRequestHandler } from '../handlers/conversations.handler';
import { MessagesRequestHandler } from '../handlers/messages.handler';
import { MessagingsRequestHandler } from '../handlers/messagings.handler';
import { NotificationsRequestHandler } from '../handlers/notifications.handler';
import { UsersRequestHandler } from '../handlers/users.handler';
import { WatchesRequestHandler } from '../handlers/watches.handler';



export const UsersRouter: Router = Router({ mergeParams: true });



// GET
UsersRouter.get('/id/:id', UsersRequestHandler.get_user_by_id);
UsersRouter.get('/phone/:phone', UsersRequestHandler.get_user_by_phone);
UsersRouter.get('/check-session', UsersRequestHandler.check_session);
UsersRouter.get('/verify-email/:verification_code', UsersRequestHandler.verify_email);
UsersRouter.get('/send-sms-verification/:phone_number', YouAuthorizedSlim, UsersRequestHandler.send_sms_verification);
UsersRouter.get('/verify-sms-code/request_id/:request_id/code/:code', YouAuthorizedSlim, UsersRequestHandler.verify_sms_code);
UsersRouter.get('/:you_id/unseen-counts', YouAuthorized, UsersRequestHandler.get_unseen_counts);
UsersRouter.get('/:you_id/notifications/all', YouAuthorized, NotificationsRequestHandler.get_user_notifications_all);
UsersRouter.get('/:you_id/notifications', YouAuthorized, NotificationsRequestHandler.get_user_notifications);
UsersRouter.get('/:you_id/notifications/:notification_id', YouAuthorized, NotificationsRequestHandler.get_user_notifications);

UsersRouter.get('/:you_id/home-stats', YouAuthorized, UsersRequestHandler.get_user_home_page_stats);

UsersRouter.get('/:you_id/messagings/all', YouAuthorized, MessagingsRequestHandler.get_user_messagings_all);
UsersRouter.get('/:you_id/messagings', YouAuthorized, MessagingsRequestHandler.get_user_messagings);
UsersRouter.get('/:you_id/messagings/:messagings_timestamp', YouAuthorized, MessagingsRequestHandler.get_user_messagings);

UsersRouter.get('/:you_id/messages/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);
UsersRouter.get('/:you_id/messages/:user_id/:min_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.get_user_messages);

UsersRouter.get('/:you_id/conversations/all', YouAuthorized, ConversationsRequestHandler.get_user_conversations_all);
UsersRouter.get('/:you_id/conversations', YouAuthorized, ConversationsRequestHandler.get_user_conversations);
UsersRouter.get('/:you_id/conversations/:conversation_timestamp', YouAuthorized, ConversationsRequestHandler.get_user_conversations);

UsersRouter.get('/:you_id/conversations/:conversation_id/members/all', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members_all);
UsersRouter.get('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members);
UsersRouter.get('/:you_id/conversations/:conversation_id/members/:member_id', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.get_conversation_members);

UsersRouter.get('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesRequestHandler.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/messages/:message_id', YouAuthorized, ConversationMessagesRequestHandler.get_conversation_messages);
UsersRouter.get('/:you_id/conversations/:conversation_id/search-users', YouAuthorized, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.search_members);
UsersRouter.get('/:you_id/conversations/:conversation_id/check-conversation-member', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.check_conversation_member);
UsersRouter.get('/:you_id/conversations/:conversation_id/check-conversation-member-request', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.check_conversation_member_request);

UsersRouter.get('/:you_id/watches/all', YouAuthorized, WatchesRequestHandler.get_user_watches_all);
UsersRouter.get('/:you_id/watches', YouAuthorized, WatchesRequestHandler.get_user_watches);
UsersRouter.get('/:you_id/watches/:watch_timestamp', YouAuthorized, WatchesRequestHandler.get_user_watches);

UsersRouter.get('/:you_id/watches/:watch_id/members/all', YouAuthorized, WatchExists, WatchesRequestHandler.get_watch_members_all);
UsersRouter.get('/:you_id/watches/:watch_id/members', YouAuthorized, WatchExists, WatchesRequestHandler.get_watch_members);
UsersRouter.get('/:you_id/watches/:watch_id/members/:member_id', YouAuthorized, WatchExists, WatchesRequestHandler.get_watch_members);

UsersRouter.get('/:you_id/watches/:watch_id/messages', YouAuthorized, WatchesRequestHandler.get_watch_messages);
UsersRouter.get('/:you_id/watches/:watch_id/messages/:message_id', YouAuthorized, WatchesRequestHandler.get_watch_messages);
UsersRouter.get('/:you_id/watches/:watch_id/search-users', YouAuthorized, WatchExists, IsWatchOwner, WatchesRequestHandler.search_members);
UsersRouter.get('/:you_id/watches/:watch_id/check-watch-member', YouAuthorized, WatchExists, WatchesRequestHandler.check_watch_member);
UsersRouter.get('/:you_id/watches/:watch_id/check-watch-member-request', YouAuthorized, ConversationExists, WatchesRequestHandler.check_watch_member_request);

// Public GET




// POST
UsersRouter.post('/', UsersRequestHandler.sign_up);
UsersRouter.post('/:you_id/feedback', YouAuthorized, UsersRequestHandler.send_feedback);
UsersRouter.post('/:you_id/send-message/:user_id', YouAuthorized, UserIdsAreDifferent, MessagesRequestHandler.send_user_message);
UsersRouter.post('/:you_id/notifications/update-last-opened', YouAuthorized, NotificationsRequestHandler.update_user_last_opened);

UsersRouter.post('/:you_id/conversations', YouAuthorized, ConversationsRequestHandler.create_conversation);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages', YouAuthorized, ConversationMessagesRequestHandler.create_conversation_message);
UsersRouter.post('/:you_id/conversations/:conversation_id/messages/:message_id/mark-as-seen', YouAuthorized, ConversationExists, ConversationMessagesRequestHandler.mark_message_as_seen);
UsersRouter.post('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.add_conversation_member);
UsersRouter.post('/:you_id/conversations/:conversation_id/send-member-request', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.send_member_request);
UsersRouter.post('/:you_id/conversations/:conversation_id/cancel-member-request', YouAuthorized, ConversationExists, ConversationMembersRequestHandler.cancel_member_request);
UsersRouter.post('/:you_id/conversations/:conversation_id/accept-member-request/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.accept_member_request);
UsersRouter.post('/:you_id/conversations/:conversation_id/reject-member-request/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.reject_member_request);


UsersRouter.post('/:you_id/watches', YouAuthorized, WatchesRequestHandler.create_watch);
UsersRouter.post('/:you_id/watches/:watch_id/messages', YouAuthorized, WatchesRequestHandler.create_watch_message);
UsersRouter.post('/:you_id/watches/:watch_id/messages/:message_id/mark-as-seen', YouAuthorized, WatchExists, WatchesRequestHandler.mark_message_as_seen);
UsersRouter.post('/:you_id/watches/:watch_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, WatchExists, IsWatchOwner, WatchesRequestHandler.add_watch_member);
UsersRouter.post('/:you_id/watches/:watch_id/send-member-request', YouAuthorized, WatchExists, WatchesRequestHandler.send_member_request);
UsersRouter.post('/:you_id/watches/:watch_id/cancel-member-request', YouAuthorized, WatchExists, WatchesRequestHandler.cancel_member_request);
UsersRouter.post('/:you_id/watches/:watch_id/accept-member-request/:user_id', YouAuthorized, UserIdsAreDifferent, WatchExists, IsWatchOwner, WatchesRequestHandler.accept_member_request);
UsersRouter.post('/:you_id/watches/:watch_id/reject-member-request/:user_id', YouAuthorized, UserIdsAreDifferent, WatchExists, IsWatchOwner, WatchesRequestHandler.reject_member_request);


// PUT
UsersRouter.put('/', UsersRequestHandler.sign_in);
UsersRouter.put('/:you_id/info', YouAuthorized, UsersRequestHandler.update_info);
UsersRouter.put('/:you_id/password', YouAuthorized, UsersRequestHandler.update_password);
UsersRouter.put('/:you_id/phone', YouAuthorized, UsersRequestHandler.update_phone);
UsersRouter.put('/:you_id/icon', YouAuthorized, UsersRequestHandler.update_icon);
UsersRouter.put('/:you_id/wallpaper', YouAuthorized, UsersRequestHandler.update_wallpaper);
UsersRouter.put('/:you_id/latest-coordiates', YouAuthorized, UsersRequestHandler.update_latest_coordinates);

UsersRouter.put('/:you_id/conversations/:conversation_id/update-last-opened', YouAuthorized, ConversationMessagesRequestHandler.update_conversation_last_opened);
UsersRouter.put('/:you_id/conversations/:conversation_id', YouAuthorized, ConversationsRequestHandler.update_conversation);

UsersRouter.put('/:you_id/watches/:watch_id/update-last-opened', YouAuthorized, WatchesRequestHandler.update_watch_last_opened);
UsersRouter.put('/:you_id/watches/:watch_id', YouAuthorized, WatchesRequestHandler.update_watch);

// DELETE
UsersRouter.delete('/:you_id/conversations/:conversation_id', YouAuthorized, IsConversationOwner, ConversationsRequestHandler.delete_conversation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members', YouAuthorized, ConversationExists, IsNotConversationOwner, ConversationMembersRequestHandler.leave_conversation);
UsersRouter.delete('/:you_id/conversations/:conversation_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, ConversationExists, IsConversationOwner, ConversationMembersRequestHandler.remove_conversation_member);

UsersRouter.delete('/:you_id/watches/:watch_id', YouAuthorized, IsWatchOwner, WatchesRequestHandler.delete_watch);
UsersRouter.delete('/:you_id/watches/:watch_id/members', YouAuthorized, WatchExists, IsNotWatchOwner, WatchesRequestHandler.leave_watch);
UsersRouter.delete('/:you_id/watches/:watch_id/members/:user_id', YouAuthorized, UserIdsAreDifferent, WatchExists, IsWatchOwner, WatchesRequestHandler.remove_watch_member);