import { Router } from "express";
import { Op } from "sequelize";

import { db } from "../models";

const router = Router();

/**
 * Get all Threads
 */
router.get("/all", async (req, res) => {
  const { Threads, Post } = db.getModels();

  const threads = await Threads.findAll({
    include: [{
      model: Post,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(threads);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Threads, Post } = db.getModels();

  const thread = await Threads.findByPk(id, {
    include: [{
      model: Post,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(thread);
});

export default router;
