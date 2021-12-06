import { Router } from "express";

import { getFromEnvironment } from "../util";
import { db } from "../models";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");
const router = Router();

/**
 * Retrieves all information related to the image identified by the given ID.
 * This includes CloudFront URL and thumbnails. If there is no image with the
 * given ID, 404 is returned.
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const { MediaItem } = db.getModels();

  const image = await MediaItem.findOne({
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
