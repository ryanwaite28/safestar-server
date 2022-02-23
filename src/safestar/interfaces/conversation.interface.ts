import { ICommonModel, IUser } from "./safestar.interface";

export interface IConversation extends ICommonModel {
  owner_id: number,
  is_public: boolean,
  title: string,
  icon_link: string,
  icon_id: string,
  uuid: string,

  owner?: IUser,
  unseen_messages_count?: number,
  last_opened?: string,
  members_count?: number,
}

export interface IConversationLastOpened extends ICommonModel {
  conversation_id: number,
  user_id: number,
  last_opened: string,
  uuid: string,

  user?: IUser,
  conversation?: IConversation,
}

export interface IConversationMember extends ICommonModel {
  conversation_id: number,
  user_id: number,
  role: string,
  uuid: string,

  user?: IUser,
  conversation?: IConversation,
}

export interface IConversationMemberRequest extends ICommonModel {
  conversation_id: number,
  user_id: number,
  status: number, // null = pending, 2 = canceled, 1 = accepted, 0 = rejected
  role: string,
  uuid: string,
  
  user?: IUser,
  sender?: IUser,
  conversation?: IConversation,
}

export interface IConversationMessage extends ICommonModel {
  conversation_id: number,
  parent_message_id: number,
  owner_id: number,
  body: string,
  uuid: string,
  
  conversation?: IConversation,
  owner?: IUser,
  photos?: IConversationPhoto[],
  audios?: IConversationAudio[],
  videos?: IConversationVideo[],
}

export interface IConversationPhoto extends ICommonModel {
  message_id: number,
  photo_id: string,
  photo_link: string,
  uuid: string,
}

export interface IConversationAudio extends ICommonModel {
  message_id: number,
  s3object_bucket: string,
  s3object_key: string,
  uuid: string,
}

export interface IConversationVideo extends ICommonModel {
  message_id: number,
  s3object_bucket: string,
  s3object_key: string,
  uuid: string,
}

export interface IConversationMessageSeen extends ICommonModel {
  conversation_id: number,
  message_id: number,
  user_id: number,
  seen: boolean,
  uuid: string,

  conversation?: IConversation,
}
