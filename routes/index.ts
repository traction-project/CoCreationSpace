import { Router } from "express";

import VideoRouter from "./video";

const router = Router();

router.use("/video", VideoRouter);

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault" });
});

export default router;
