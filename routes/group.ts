import { Router } from "express";

import { authRequired } from "../util/middleware";
import { UserInstance } from "models/user";
import { db } from "../models";

const router = Router();

/**
 * Returns all groups with their name and ids.
 */
router.get("/all", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const groups = await UserGroup.findAll({
    attributes: ["id", "name"]
  });

  res.send(groups);
});

/**
 * Returns the groups that the current user is a member of or has a pending
 * join request.
 */
router.get("/me", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const groups = await user.getUserGroups({
    attributes: ["id", "name"]
  });

  res.send(groups);
});

/**
 * Returns the groups that the current user is an approved member of
 */
router.get("/me/approved", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const groups = await user.getApprovedUserGroups();

  res.send(groups);
});

/**
 * Makes the current user join the group identified by the given id. If the
 * selected group is the first group that the user joins, no admin approval is
 * required. Returns 200 on success, or 404 if the group with the given id
 * cannot be found.
 */
router.post("/:id/join", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const isFirstGroup = (await user.countUserGroups()) == 0;
  const group = await UserGroup.findByPk(id);

  if (group) {
    if (isFirstGroup) {
      await user.addUserGroup(group, { through: { approved: true }});
    } else {
      await user.addUserGroup(group);
    }

    res.send({
      status: "OK"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Group not found"
    });
  }
});

/**
 * Makes the current user leave the group identified by the given id. Returns
 * 200 on success, or 404 if the group with the given id cannot be found.
 */
router.post("/:id/leave", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const group = await UserGroup.findByPk(id);

  if (group) {
    await user.removeUserGroup(group);

    res.send({
      status: "OK"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Group not found"
    });
  }
});

/**
 * Approve request for joining a group. This action can only be performed by
 * users with the admin permission.
 */
router.post("/:id/user/:userId/approve", authRequired, async (req, res) => {
  const { GroupMembership } = db.getModels();
  const { id, userId } = req.params;
  const user = req.user as UserInstance;

  if (!user.isAdmin()) {
    return res.status(400).send({
      status: "ERR",
      message: "Insufficient permissions"
    });
  }

  const membership = await GroupMembership.findOne({
    where: {
      userGroupId: id, userId
    } as any
  });

  if (!membership) {
    return res.status(400).send({
      status: "ERR",
      message: "No such request"
    });
  }

  membership.approved = true;
  await membership.save();

  res.send({
    status: "OK"
  });
});

/**
 * Approve request for changing a group role for a given user. This action can
 * only be performed by users with the admin permission.
 */
router.post("/:id/user/:userId/approverole", authRequired, async (req, res) => {
  const { GroupMembership } = db.getModels();
  const { id, userId } = req.params;
  const user = req.user as UserInstance;

  if (!user.isAdmin()) {
    return res.status(400).send({
      status: "ERR",
      message: "Insufficient permissions"
    });
  }

  const membership = await GroupMembership.findOne({
    where: {
      userGroupId: id, userId
    } as any
  });

  if (!membership) {
    return res.status(400).send({
      status: "ERR",
      message: "No such request"
    });
  }

  membership.roleApproved = true;
  await membership.save();

  res.send({
    status: "OK"
  });
});

/**
 * Creates a new request to change the current user's role within the given
 * group.
 */
router.post("/:id/requestrole/:role", authRequired, async (req, res) => {
  const { GroupMembership } = db.getModels();
  const { id, role } = req.params;
  const user = req.user as UserInstance;

  const membership = await GroupMembership.findOne({
    where: {
      userGroupId: id, userId: user.id
    } as any
  });

  if (!membership) {
    return res.status(400).send({
      status: "ERR",
      message: "No such request"
    });
  }

  if (!["participant", "facilitator", "moderator", "admin"].find((r) => r == role)) {
    return res.status(400).send({
      status: "ERR",
      message: "Invalid role"
    });
  }

  membership.role = role as any;
  membership.roleApproved = false;
  await membership.save();

  res.send({
    status: "OK"
  });
});

export default router;
