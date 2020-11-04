import { Router } from "express";

import { UserInstance } from "../models/users";
import { authRequired } from "../util";
import { db } from "../models";

const router = Router();

/**
 * Get all topics
 */
router.get("/all", async (req, res) => {
  const { Topics } = db.getModels();

  const topics = await Topics.findAll();
  return res.send(topics);
});

/**
 * Get topic with given id and its associated threads
 */
router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const { Threads, Topics } = db.getModels();

  const topic = await Topics.findByPk(id, {
    include: [{
      model: Threads,
      as: "thread"
    }]
  });

  return res.send(topic);
});

router.post("/id/:id/interest", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Topics } = db.getModels();

  const topic = await Topics.findByPk(id);

  if (topic) {
    await topic.addInterestsUser(user);

    const interests = await user.getInterestsTopics();
    res.send({ interests });
  }
});

export default router;
