import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util";
import { UserInstance } from "models/users";

const router = Router();

/**
 * Retrieve all notifications for the current user.
 */
router.get("/", authRequired, async (req, res) => {
  const { Notifications } = db.getModels();
  const user = req.user as UserInstance;

  const notifications = await Notifications.findAll({
    where: { user: user },
    order: ["createdAt", "DESC"]
  });

  res.send({
    notifications
  });
});

/**
 * Retrieve all new notifications for the current user.
 */
router.get("/new", authRequired, async (req, res) => {
  const { Notifications } = db.getModels();
  const user = req.user as UserInstance;

  const notifications = await Notifications.findAll({
    where: { user: user, seen: false },
    order: ["createdAt", "DESC"]
  });

  res.send({
    notifications
  });
});

/**
 * Mark the notification with the given ID as seen.
 */
router.post("/:id/seen", authRequired, async (req, res) => {
  const { Notifications } = db.getModels();
  const { id } = req.params;

  const notification = await Notifications.findByPk(id);

  if (notification) {
    notification.seen = true;
    await notification.save();

    res.send({
      status: "OK"
    });
  } else {
    res.status(400).send({
      status: "ERR",
      message: "No such notification"
    });
  }
});

/**
 * Delete the notification with the given id
 */
router.delete("/:id", authRequired, async (req, res) => {
  const { Notifications } = db.getModels();
  const { id } = req.params;

  const notification = await Notifications.findByPk(id);

  if (notification) {
    await notification.destroy();

    res.send({
      status: "OK"
    });
  } else {
    res.status(400).send({
      status: "ERR",
      message: "No such notification"
    });
  }
});

export default router;
