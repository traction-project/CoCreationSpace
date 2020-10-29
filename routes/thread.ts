import { Router } from "express";
import { db } from "../models";
import { Op } from "sequelize";

const router = Router();

/**
 * Get all Threads
 */
router.get("/all", async (req, res) => {
  const { Threads, Posts } = db.getModels();

  const threads = await Threads.findAll({
    include: [{
      model: Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(threads);
});

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const { Threads, Posts } = db.getModels();

  const thread = await Threads.findByPk(id, {
    include: [{
      model: Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(thread);
});

export default router;
