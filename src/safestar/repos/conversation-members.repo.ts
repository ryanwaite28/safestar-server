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
import { PlainObject } from '../interfaces/safestar.interface';
import { ConversationMembers } from '../models/conversation.model';
import { Users } from '../models/user.model';
import { user_attrs_slim } from '../safestar.chamber';



export async function get_conversation_members_all(conversation_id: number) {
  const results = await ConversationMembers.findAll({
    where: { conversation_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });

  return results;
}

export async function get_conversation_members(conversation_id: number, member_id?: number) {
  const whereClause: PlainObject = member_id
    ? { conversation_id, id: { [Op.lt]: member_id } }
    : { conversation_id };

  const results = await ConversationMembers.findAll({
    where: whereClause,
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
    limit: 10,
    order: [['id', 'DESC']]
  });

  return results;
}

export async function get_conversation_member_by_user_id(user_id: number) {
  const member_model = await ConversationMembers.findOne({
    where: { user_id }
  });

  return member_model;
}

export async function get_conversation_member_by_conversation_id(conversation_id: number) {
  const member_model = await ConversationMembers.findOne({
    where: { conversation_id }
  });

  return member_model;
}

export async function get_conversation_member_by_user_id_and_conversation_id(user_id: number, conversation_id: number) {
  const member_model = await ConversationMembers.findOne({
    where: { conversation_id, user_id }
  });

  return member_model;
}

export async function find_or_create_conversation_member(user_id: number, conversation_id: number) {
  // get all the conversations that the user is a part of via when they last opened it
  let member = await ConversationMembers.findOne({
    where: {
      conversation_id,
      user_id
    },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });

  if (!member) {
    await ConversationMembers.create({ conversation_id, user_id });
    member = await ConversationMembers.findOne({
      where: {
        conversation_id,
        user_id
      },
      include: [{
        model: Users,
        as: 'user',
        attributes: user_attrs_slim
      }]
    }); 
  }

  return member!;
}

export async function remove_conversation_member(user_id: number, conversation_id: number) {
  // get all the conversations that the user is a part of via when they last opened it
  return ConversationMembers.destroy({
    where: {
      conversation_id,
      user_id
    }
  });
}