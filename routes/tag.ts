import { Router } from "express";
import { db } from "../models";
import { Op } from "sequelize";


const router = Router();

/**
 * Get all tags
 */
router.get("/all", async (req, res) => {
  const TagModel = db.getModels().Tags;

  const tags = await TagModel.findAll();

  res.send(tags);
});

/**
 * Get tag by id 
 */
router.get("/id/:id", async (req, res) => {
  const { id } = req.params;
  const TagModel = db.getModels().Tags;

  const tag = await TagModel.findByPk(id, { 
    include: [{
      model: db.getModels().Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }},
      include: ["user", {
        model: db.getModels().DataContainer,
        as: "dataContainer",
        include: ["multimedia"]
      }]
    }],
    order: [
      ["post", "created_at", "DESC"]
    ]
  });

  res.send(tag);
});

export default router;
