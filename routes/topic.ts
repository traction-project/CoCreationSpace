import { Router } from "express";

import { UserInstance } from "../models/users";
import { authRequired } from "../util/middleware";
import { db } from "../models";

const router = Router();

/**
 * Get all topics
 */
router.get("/all", async (req, res) => {
  const { Topic } = db.getModels();

  const topics = await Topic.findAll();
  return res.send(topics);
});

/**
 * Get all topics for the groups the logged in user is a member of
 */
router.get("/group", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Topic, UserGroup } = db.getModels();

  const groups = (await user.getUserGroups()).map((group) => group.id);

  const topics = await Topic.findAll({
    include: [{
      model: UserGroup,
      as: "userGroup",
      required: true,
      where: {
        id: groups
      }
    }]
  });

  return res.send(topics);
});

/**
 * Get topic with given id and its associated threads
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Thread, Topic } = db.getModels();

  const topic = await Topic.findByPk(id, {
    include: [{
      model: Thread,
      as: "threads"
    }]
  });

  return res.send(topic);
});

/**
 * Adds an interest in the topic given by the id for the currently logged in
 * user. Returns an updated list of interests for the user.
 */
router.post("/:id/interest", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Topic } = db.getModels();

  const topic = await Topic.findByPk(id);

  if (topic) {
    await topic.addHasInterest(user);

    const interests = await user.getInterestedTopics();
    res.send({ interests });
  }
});

export default router;
