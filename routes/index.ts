import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.render("index", { title: "MediaVault" });
});

export default router;
