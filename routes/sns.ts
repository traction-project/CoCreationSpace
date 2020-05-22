import { Router } from "express";
import { snsMiddleware, confirmSubscription } from "../util/sns";

const router = Router();
router.use(snsMiddleware);

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
