import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.send({
    status: "OK"
  });
});

export default router;
