import { Router } from "express";

import { getFromEnvironment, Range } from "../util";
import { fetchTranscript, transcribeOutputToVTT } from "../util/transcribe";
import { confirmSubscription } from "../util/sns";
import { db } from "../models";

const [ SNS_ARN ] = getFromEnvironment("SNS_ARN");

const router = Router();

router.post("/receive", (req, res) => {
  if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
    console.log("Confirming subscription");

    confirmSubscription(req.headers as any, req.body).then(() => {
      console.log("SNS subscription confirmed");
    }).catch((err) => {
      console.error("Could not confirm SNS subscription:", err);
    });
  } else {
    const topic = req.headers["x-amz-sns-topic-arn"];

    if (topic !== SNS_ARN) {
      console.error("Invalid ARN");
      res.send("");

      return;
    }

    const data = JSON.parse(req.body.Message);

    // transcription service notification
    if (data.source == "aws.transcribe" && data.detail.TranscriptionJobStatus == "COMPLETED") {
      console.log("transcribe message received");
      insertVideoTranscript(data.detail.TranscriptionJobName);
    } else if (data.pipelineId && data.state == "COMPLETED") {
      // process transcoder notification
      insertMetadata(data);
    }
  }

  res.send("");
});

export async function insertVideoTranscript(jobName: string) {
  const { language, transcript } = await fetchTranscript(jobName);
  const { Multimedia, Subtitles } = db.getModels();

  const video = await Multimedia.findOne({ where: { key: jobName } });

  if (video) {
    video.transcript = transcript;
    video.save();

    const subtitles = Subtitles.build();

    subtitles.language = language;
    subtitles.content = transcribeOutputToVTT(transcript);

    await subtitles.save();
    subtitles.setMultimedia(video);
  }
}

export async function insertMetadata(data: any) {
  const { jobId, outputs } = data;
  const thumbnailPattern: string = outputs[0].thumbnailPattern;

  const thumbnails = thumbnailPattern && Range(0, Math.floor(outputs[0].duration / 300) + 1).map((n) => {
    return thumbnailPattern.replace(
      "{count}",
      (n + 1).toString().padStart(5, "0")
    ) + ".png";
  });

  const resolutions = outputs.filter((o: any) => o.height).map((o: any) => o.height);

  const { Multimedia } = db.getModels();
  const media = await Multimedia.findOne({ where : { transcodingJobId: jobId } });

  if (media) {
    media.status = "done";
    media.duration = outputs[0].duration;

    if (resolutions.length > 0) {
      media.resolutions = resolutions;
    }

    if (thumbnails) {
      media.thumbnails = thumbnails;
    }

    media.save();
  }
}

export default router;
