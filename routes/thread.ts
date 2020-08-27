import { Router } from "express";
import { db } from "../models";
import { Op } from "sequelize";

const router = Router();

/**
 * Get all Threads
 */
router.get("/all", async (req, res) => {
  const ThreadModel = db.getModels().Threads;
  
  const threads = await ThreadModel.findAll({ 
    include: [{
      model: db.getModels().Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(threads);
});

router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const ThreadModel = db.getModels().Threads;

  const thread = await ThreadModel.findByPk(id, { 
    include: [{
      model: db.getModels().Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }}
    }]
  });

  return res.send(thread);
});

export default router;