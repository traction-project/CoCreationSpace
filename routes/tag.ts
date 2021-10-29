import { Router } from "express";
import { db } from "../models";
import { Op } from "sequelize";
import { buildCriteria } from "../util";


const router = Router();

/**
 * Get all tags
 */
router.get("/all", async (req, res) => {
  const { Tag } = db.getModels();
  const criteria = await buildCriteria(req.query, Tag);

  const tags = await Tag.findAll(criteria);

  res.send(tags);
});

/**
 * Get tag by id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Tag, Post, DataContainer } = db.getModels();

  const tag = await Tag.findByPk(id, {
    include: [{
      model: Post,
      where: { parent_post_id: { [Op.is] : null }},
      include: ["user", {
        model: DataContainer,
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
