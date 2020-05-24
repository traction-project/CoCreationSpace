import { Router } from "express";

import { getFromEnvironment } from "../util";
import { subscribeToSNSTopic, confirmSubscription } from "../util/sns";

const [ SNS_ARN, SNS_ENDPOINT ] = getFromEnvironment("SNS_ARN", "SNS_ENDPOINT");
subscribeToSNSTopic(SNS_ARN, `${SNS_ENDPOINT}/sns/receive`);

const router = Router();

router.post("/receive", (req, res) => {
  if (req.headers["x-amz-sns-message-type"] === "SubscriptionConfirmation") {
    confirmSubscription(req.headers as any, req.body);
  } else {
    const topic = req.headers["x-amz-sns-topic-arn"];

    switch (topic) {
    default:
    }
  }

  res.send("");
});

export default router;
