import { Router } from "express";
import { db } from "../models";
import { Op } from "sequelize";
import { buildCriteria } from "../util";


const router = Router();

/**
 * Get all tags
 */
router.get("/all", async (req, res) => {
  const { Tags } = db.getModels();
  const criteria = await buildCriteria(req.query, Tags);

  const tags = await Tags.findAll(criteria);

  res.send(tags);
});

/**
 * Get tag by id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Tags, Posts, DataContainer } = db.getModels();

  const tag = await Tags.findByPk(id, {
    include: [{
      model: Posts,
      as: "post",
      where: { parent_post_id: { [Op.is] : null }},
      include: ["user", {
        model: DataContainer,
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
