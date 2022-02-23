import { STATUSES } from "../enums/safestar.enum";
import { ITracking } from "../interfaces/tracking.interface";
import { Trackings, TrackingRequests } from "../models/tracking.model";
import { Users } from "../models/user.model";
import { convertModels, user_attrs_slim } from "../safestar.chamber";
import { paginateTable } from "./_common.repo";



export function check_user_tracking(you_id: number, user_id: number) {
  return Trackings.findOne({
    where: { user_id: you_id, tracking_id: user_id },
    include: [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
  });
}

export function check_user_tracking_request(you_id: number, user_id: number) {
  return TrackingRequests.findOne({
    where: { user_id: you_id, tracking_id: user_id, status: STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
  });
}

export async function get_user_trackers_count(
  you_id: number
) {
  const count = await Trackings.count({
    where: { tracking_id: you_id },
  });
  return count;
}

export async function get_user_trackings_count(
  you_id: number
) {
  const count = await Trackings.count({
    where: { user_id: you_id },
  });
  return count;
}

export async function get_user_tracker_requests_pending_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { tracking_id: you_id, status: STATUSES.PENDING },
  });
  return count;
}

export async function get_user_tracking_requests_pending_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { user_id: you_id, status: STATUSES.PENDING },
  });
  return count;
}

export async function get_user_tracker_requests_all_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { tracking_id: you_id },
  });
  return count;
}

export async function get_user_tracking_requests_all_count(
  you_id: number
) {
  const count = await TrackingRequests.count({
    where: { user_id: you_id },
  });
  return count;
}



export async function get_user_trackers_all(
  you_id: number,
) {
  const trackers = await Trackings.findAll({
    where: { tracking_id: you_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  }).then((models) => {
    return convertModels<ITracking>(models);
  });
  return trackers;
}

export async function get_user_trackings_all(
  you_id: number
) {
  const trackings = await Trackings.findAll({
    where: { user_id: you_id },
    include: [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim
    }]
  });
  return trackings;
}

export async function get_user_trackers(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    Trackings,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
  );
  return trackers;
}

export async function get_user_trackings(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    Trackings,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'track_user',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  );
  return trackings;
}



export async function get_user_tracker_requests_all(
  you_id: number,
) {
  const trackers = await TrackingRequests.findAll({
    where: { tracking_id: you_id },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });
  return trackers;
}

export async function get_user_tracking_requests_all(
  you_id: number
) {
  const trackings = await TrackingRequests.findAll({
    where: { user_id: you_id },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }]
  });
  return trackings;
}

export async function get_user_tracker_requests_pending_all(
  you_id: number,
) {
  const trackers = await TrackingRequests.findAll({
    where: { tracking_id: you_id, status: STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  });
  return trackers;
}

export async function get_user_tracking_requests_pending_all(
  you_id: number
) {
  const trackings = await TrackingRequests.findAll({
    where: { user_id: you_id, status: STATUSES.PENDING },
    include: [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }]
  });
  return trackings;
}

export async function get_user_tracker_requests_pending(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    TrackingRequests,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
    undefined,
    undefined,
    { status: STATUSES.PENDING },
  );
  return trackers;
}

export async function get_user_tracking_requests_pending(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    TrackingRequests,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }],
    undefined,
    undefined,
    { status: STATUSES.PENDING },
  );
  return trackings;
}


export async function get_user_tracker_requests(
  you_id: number,
  min_id?: number,
) {
  const trackers = await paginateTable(
    TrackingRequests,
    'tracking_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  );
  return trackers;
}

export async function get_user_tracking_requests(
  you_id: number,
  min_id: number,
) {
  const trackings = await paginateTable(
    TrackingRequests,
    'user_id',
    you_id,
    min_id,
    [{
      model: Users,
      as: 'tracking',
      attributes: user_attrs_slim
    }, {
      model: Users,
      as: 'user',
      attributes: user_attrs_slim
    }]
  );
  return trackings;
}
