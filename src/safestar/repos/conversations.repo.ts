import {
  Op,
  cast,
  col,
  fn
} from 'sequelize';
import { Model } from 'sequelize/types';
import { IConversation, IConversationMember } from '../interfaces/conversation.interface';
import { IUser, PlainObject } from '../interfaces/safestar.interface';
import { ConversationMembers, Conversations, ConversationLastOpeneds, ConversationMessages } from '../models/conversation.model';
import { Users } from '../models/user.model';
import { convertModel, convertModels, user_attrs_slim } from '../safestar.chamber';



export async function get_conversation_by_id(id: number) {
  return Conversations.findOne({
      where: { id },
    })
    .then((model: Model | any) => {
      return convertModel<IConversation>(model);
    });
}

export function get_user_conversations_all(user_id: number) {
  // get all the conversations that the user is a part of
  return ConversationMembers.findAll({
    where: { user_id },
    include: [{
      model: Conversations,
      as: 'conversation',
      include: [{
        model: ConversationMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('conversationMember.conversation_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    group: ['conversationMember.id', 'conversation.id']
  });
}

export function get_user_conversations(user_id: number, conversation_timestamp?: string) {
  const whereClause: PlainObject = { user_id };
  if (conversation_timestamp) {
    whereClause.updated_at = { [Op.lt]: conversation_timestamp };
  }

  // get all the conversations that the user is a part of via when they last opened it
  return ConversationLastOpeneds.findAll({
    where: whereClause,
    include: [{
      model: Conversations,
      as: 'conversation',
      include: [{
        model: ConversationMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('conversationMember.conversation_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['last_opened', 'DESC']],
    limit: 5
  });
}

export function get_user_conversations_exclude_all(user_id: number) {
  // get all the conversations that the user is a part of
  return ConversationMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Conversations,
      as: 'conversation',
      include: [{
        model: ConversationMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('conversationMember.conversation_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    group: ['conversationMember.id', 'conversation.id']
  });
}

export function get_user_conversations_exclude(user_id: number) {
  // get all the conversations that the user is a part of
  return ConversationMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Conversations,
      as: 'conversation',
      include: [{
        model: ConversationMembers,
        as: 'members',
        attributes: []
      }],
      attributes: {
        include: [
          [cast(fn('COUNT', col('conversationMember.conversation_id')), 'integer') ,'members_count']
        ]
      }
    }],
    order: [['id', 'DESC']],
    // group: ['conversationMember.id', 'conversation.id']
    limit: 5,
  });
}

export async function get_user_unread_conversations_messages_count(user_id: number) {
  const conversations_member_models = await ConversationMembers.findAll({
    where: { user_id },
    include: [{
      model: Conversations,
      as: 'conversation',
    }],
    order: [['id', 'DESC']],
  });

  let count = 0;

  for (const conversation_member of conversations_member_models) {
    const conversationMemberObj: PlainObject = conversation_member.toJSON();
    const conversation_id = conversationMemberObj.conversation_id;
    // when a user is added to a conversation, a record for last opened is also created; assume there is a record
    const last_opened_model = await ConversationLastOpeneds.findOne({
      where: { conversation_id, user_id }
    });
    const you_last_opened = last_opened_model!.get('last_opened') as string;
    // find how many messages are in the conversation since the user last opened it
    const unseen_messages_count = await ConversationMessages.count({
      where: { conversation_id, created_at: { [Op.gt]: you_last_opened }, owner_id: { [Op.not]: user_id } }
    });
    // conversationMemberObj.unseen_messages_count = unseen_messages_count;
    count = count + unseen_messages_count;
  }

  return count;
}

export function find_or_create_user_conversation_last_opened(user_id: number, conversation_id: number) {
  return ConversationLastOpeneds.findOrCreate({
    where: {
      conversation_id,
      user_id
    }
  });
}

export function get_recent_conversations(user_id: number) {

  // return Conversations.findAll({
  //   where: { owner_id: {[Op.ne]: (user_id || -1)} },
  //   order: [['id', 'DESC']],
  //   limit: 20,
  //   include: [{
  //     model: Users,
  //     as: `owner`,
  //     attributes: user_attrs_slim,
  //   }]
  // })
  // .then((models: Model[]) => {
  //   return convertModels<IConversation>(<Model[]> models);
  // });

  // get all the conversations that the user is a part of
  return ConversationMembers.findAll({
    where: { user_id: {[Op.ne]: user_id} },
    include: [{
      model: Conversations,
      as: 'conversation',
      where: { owner_id: {[Op.ne]: user_id} },
      // attributes: [
      //   [fn('DISTINCT', col('id')), 'id']
      // ]
      // include: [{
      //   model: ConversationMembers,
      //   as: 'members',
      // }],
      // attributes: {
      //   include: [
      //     [cast(fn('COUNT', col('conversationMember.conversation_id')), 'integer') ,'members_count']
      //   ]
      // }
    }],
    order: [['id', 'DESC']],
    group: ['conversationMember.id', 'conversation.id'],
    // group: ['conversation.id'],
    limit: 20,
  })
  .then((models: Model[]) => {
    const list: IConversation[] = [];
    const data = models
      .map((model) => (model.toJSON()) as IConversationMember)
      .forEach((member) => {
        if (!list.find(c => c.id === member.conversation_id)) {
          list.push(member.conversation!);
        }
      });
    return list;
  });
}
