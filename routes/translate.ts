import { Router } from "express";
import { db } from "../models";
import { generateCues, generateVTT, translateCues } from "../util/transcribe";
import { authRequired } from "../util/middleware";

const router = Router();

/**
 * Automatically translate the media item identified by the given `id` into the
 * language identified by `target`. Where `target` is a language code (such as
 * en, de or es). If translation fails or the original multimedia item has no
 * transcript available, HTTP error 400 is returned.
 */
router.post("/:id/:target", authRequired, async (req, res) => {
  const { id, target } = req.params;
  const { Multimedia, Subtitle } = db.getModels();

  const video = await Multimedia.findByPk(id);

  if (video && video.transcript) {
    const [ existingSubtitle ] = await video.getSubtitles({
      where: {
        language: target,
      }
    });

    if (existingSubtitle) {
      return res.send({
        status: "exists",
        subtitleId: existingSubtitle.id
      });
    }

    try {
      const cues = generateCues(video.transcript);
      const translatedCues = await translateCues(cues, target);

      const subtitles = Subtitle.build();

      subtitles.language = target;
      subtitles.content = generateVTT(translatedCues);

      await subtitles.save();
      subtitles.setMultimedia(video);

      res.send({
        status: "OK",
        subtitleId: subtitles.id
      });
    } catch (e) {
      res.status(400);
      res.send(e);
    }
  } else {
    res.status(400);
    res.send("No transcript available");
  }
});

/**
 * Adds a manually created set of subtitles to the multimedia item specified by
 * the given ID. The parameter `target` speicifes the language of the new
 * subtitles.
 */
router.post("/:id/:target/manual", async (req, res) => {
  const { id, target } = req.params;
  const cues = req.body;

  const { Subtitle } = db.getModels();
  const subtitles = Subtitle.build();

  subtitles.language = target;
  subtitles.content = generateVTT(cues);

  await subtitles.save();
  subtitles.setMultimedia(id);

  res.send("OK");
});

/**
 * Retrieve transcript for media item with given ID. Returns with HTTP error
 * 404 if no such transcript is available.
 */
router.get("/:id/transcript", authRequired, async (req, res) => {
  const { id } = req.params;
  const { Multimedia } = db.getModels();

  const video = await Multimedia.findByPk(id);

  if (video && video.transcript) {
    res.json(generateCues(video.transcript));
  } else {
    res.status(400);
    res.send("No transcript available");
  }
});

export default router;
