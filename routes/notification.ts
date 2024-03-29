import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util/middleware";
import { UserInstance } from "models/user";

const router = Router();

/**
 * Retrieve all notifications for the current user.
 */
router.get("/", authRequired, async (req, res) => {
  const { Notification } = db.getModels();
  const user = req.user as UserInstance;

  // TODO Type definitions of models need to be adapted so this is possible
  // without the cast to 'any'
  const notifications = await Notification.findAll({
    where: { userId: user.id },
    order: [["createdAt", "DESC"]]
  });

  res.send(
    notifications.map((n) => {
      return {
        id: n.id,
        data: n.data,
        seen: n.seen,
        createdAt: n.createdAt
      };
    })
  );
});

/**
 * Retrieve all new notifications for the current user.
 */
router.get("/new", authRequired, async (req, res) => {
  const { Notification } = db.getModels();
  const user = req.user as UserInstance;

  // TODO Type definitions of models need to be adapted so this is possible
  // without the cast to 'any'
  const notifications = await Notification.findAll({
    where: { userId: user.id, seen: false },
    order: [["createdAt", "DESC"]]
  });

  res.send(
    notifications.map((n) => {
      return {
        id: n.id,
        data: n.data,
        seen: n.seen,
        createdAt: n.createdAt
      };
    })
  );
});

/**
 * Mark the notification with the given ID as seen.
 */
router.post("/:id/seen", authRequired, async (req, res) => {
  const { Notification } = db.getModels();
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

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
  const { Notification } = db.getModels();
  const { id } = req.params;

  const notification = await Notification.findByPk(id);

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
