import { Router } from "express";
import { db } from "../models";
import { generateCues, generateVTT } from "../util/transcribe";
import { translateText } from "../util";

const router = Router();

router.post("/:id/:target", async (req, res) => {
  const { id, target } = req.params;
  const { Multimedia, Subtitles } = db.getModels();

  const video = await Multimedia.findOne({ where: { id } });

  if (video && video.transcript) {
    try {
      const cues = generateCues(video.transcript);
      const cueText = cues.map((c) => c.cue).join("\n");
      const translatedCues = await translateText(cueText, target);

      translatedCues.split("\n").forEach((cue, i) => {
        cues[i].cue = cue;
      });

      const subtitles = Subtitles.build();

      subtitles.language = target;
      subtitles.content = generateVTT(cues);

      await subtitles.save();
      subtitles.setMultimedia(video);

      res.send("OK");
    } catch (e) {
      res.status(400);
      res.send(e);
    }
  } else {
    res.status(400);
    res.send("No available transcript");
  }
});

export default router;
