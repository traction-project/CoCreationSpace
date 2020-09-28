import { Router } from "express";
import { db } from "../models";
import { generateCues, generateVTT, translateCues } from "../util/transcribe";
import { authRequired } from "../util";

const router = Router();

router.post("/:id/:target", authRequired, async (req, res) => {
  const { id, target } = req.params;
  const { Multimedia, Subtitles } = db.getModels();

  const video = await Multimedia.findByPk(id);

  if (video && video.transcript) {
    try {
      const cues = generateCues(video.transcript);
      const translatedCues = await translateCues(cues, target);

      const subtitles = Subtitles.build();

      subtitles.language = target;
      subtitles.content = generateVTT(translatedCues);

      await subtitles.save();
      subtitles.setMultimedia(video);

      res.send("OK");
    } catch (e) {
      res.status(400);
      res.send(e);
    }
  } else {
    res.status(400);
    res.send("No transcript available");
  }
});

router.post("/:id/:target/manual", async (req, res) => {
  const { id, target } = req.params;
  const cues = req.body;

  const { Subtitles } = db.getModels();
  const subtitles = Subtitles.build();

  subtitles.language = target;
  subtitles.content = generateVTT(cues);

  await subtitles.save();
  subtitles.setMultimedia(id);

  res.send("OK");
});

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
