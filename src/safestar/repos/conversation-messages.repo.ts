import {
  fn,
  Op,
  WhereOptions,
  FindOptions,
  Includeable,
  Model,
  FindAttributeOptions,
  GroupOption,
  Order
} from 'sequelize';
import { ConversationMessages } from '../models/conversation.model';

export async function create_conversation_message(conversation_id: number, body: string) {
  if (!body) {
    console.log({ body });
    throw new TypeError(`body argument was invalid...`);
  }

  const results = await ConversationMessages.create({
    conversation_id,
    body,
  });

  return results;
}