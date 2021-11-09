import { Router } from "express";

import { db } from "../models";

const router = Router();

/**
 * Get all Threads
 */
router.get("/all", async (req, res) => {
  const { Thread, Post } = db.getModels();

  const threads = await Thread.findAll({
    include: [{
      model: Post,
      where: { parent_post_id: null }
    }]
  });

  return res.send(threads);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Thread, Post } = db.getModels();

  const thread = await Thread.findByPk(id, {
    include: [{
      model: Post,
      where: { parent_post_id: null }
    }]
  });

  return res.send(thread);
});

export default router;
