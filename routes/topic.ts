import { Router } from "express";
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

export default router;
