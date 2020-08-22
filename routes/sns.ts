import { Router } from "express";

import { getFromEnvironment, Range } from "../util";
import { fetchTranscript } from "../util/transcribe";
import { subscribeToSNSTopic, confirmSubscription } from "../util/sns";
import { db } from "../models";

const [ SNS_ARN, SNS_ENDPOINT ] = getFromEnvironment("SNS_ARN", "SNS_ENDPOINT");
subscribeToSNSTopic(SNS_ARN, `${SNS_ENDPOINT}/sns/receive`);

const router = Router();

router.post("/receive", (req, res) => {
  if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
    confirmSubscription(req.headers as any, req.body);
  } else {
    const topic = req.headers["x-amz-sns-topic-arn"];

    if (topic == SNS_ARN) {
      const data = JSON.parse(req.body.Message);

      // transcription service notification
      if (data.source == "aws.transcribe" && data.detail.TranscriptionJobStatus == "COMPLETED") {
        console.log("transcribe message received");
        insertVideoTranscript(data.detail.TranscriptionJobName);
      } else if (data.pipelineId && data.state == "COMPLETED") {
        // process transcoder notification
        insertVideoMetadata(data);
      }
    }
  }

  res.send("");
});

export async function insertVideoTranscript(jobName: string) {
  const { language, transcript } = await fetchTranscript(jobName);
  const { Multimedia, Subtitles } = db.getModels();

  const video = await Multimedia.findOne({ where: { key: jobName } });

  if (video) {
    const subtitles = Subtitles.build();

    subtitles.language = language;
    subtitles.file = transcript;

    await subtitles.save();
    subtitles.setMultimedia(video);
  }
}

export async function insertVideoMetadata(data: any) {
  const { jobId, outputs } = data;
  const thumbnailPattern: string = outputs[0].thumbnailPattern;

  const thumbnails = Range(0, Math.floor(outputs[0].duration / 300) + 1).map((n) => {
    return thumbnailPattern.replace(
      "{count}",
      (n + 1).toString().padStart(5, "0")
    ) + ".png";
  });

  const Multimedia = db.getModels().Multimedia;
  const video = await Multimedia.findOne({ where : { transcodingJobId: jobId } });

  if (video) {
    video.status = "done";
    video.thumbnails = thumbnails;
    video.resolutions = outputs.filter((o: any) => o.height).map((o: any) => o.height);
    video.duration = outputs[0].duration;

    video.save();
  }
}

export default router;
