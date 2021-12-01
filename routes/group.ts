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
 * Returns the groups that the current user is a member of
 */
router.get("/me", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const groups = await user.getUserGroups({
    attributes: ["id", "name", "groupMembership"]
  });

  res.send(groups);
});

/**
 * Makes the current user join the group identified by the given id. Returns
 * 200 on success, or 404 if the group with the given id cannot be found.
 */
router.post("/:id/join", authRequired, async (req, res) => {
  const { UserGroup } = db.getModels();

  const { id } = req.params;
  const user = req.user as UserInstance;

  const group = await UserGroup.findByPk(id);

  if (group) {
    await user.addUserGroup(group);

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

export default router;
