import { Router } from "express";

import APIRouter from "./api";
import SNSRouter from "./sns";
import VideoRouter from "./video";

const router = Router();

router.use("/api", APIRouter);
router.use("/sns", SNSRouter);
router.use("/video", VideoRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault" });
});

export default router;
