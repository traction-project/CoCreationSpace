import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util/middleware";
import { UserInstance } from "../models/user";

const router = Router();

router.post("/request/:type/:groupId", authRequired, async (req, res) => {
  const { type, groupId } = req.params;
  const user = req.user as UserInstance;

  const { UserGroup, Permission } = db.getModels();

  const permission = await Permission.findOne({ where: { type }});
  const group = await UserGroup.findByPk(groupId);

  if (!permission || !group) {
    return res.status(400).send({
      status: "ERR",
      message: "Invalid parameters"
    });
  }

  await user.addPermission(permission, { through: { userGroupId: group.id }});
  res.send({ status: "OK" });
});

export default router;
