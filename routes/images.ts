import { Router } from "express";

import { getFromEnvironment } from "../util";
import { db } from "../models";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");
const router = Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { Multimedia } = db.getModels();

  const image = await Multimedia.findOne({
    where: { id, type: "image" }
  });

  if (image) {
    res.send({
      ...image,
      url: `${CLOUDFRONT_URL}/${image.title}`,
      thumbnail: `${(image.thumbnails && image.thumbnails.length > 0) ? `${CLOUDFRONT_URL}/${image.thumbnails[0]}`: null}`
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "No such image"
    });
  }
});

export default router;
