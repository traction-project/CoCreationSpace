import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util/middleware";
import { UserInstance } from "../models/user";

const router = Router();

/**
 * Create a new collection by passing name and description as JSON params in
 * the POST body. The name param is required. If the collection was created
 * successfully, an object containing the new collection's ID is returned.
 */
router.post("/collection", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { name, description } = req.body;

  const { NoteCollection } = db.getModels();

  if (!name) {
    return res.status(400).send({
      status: "ERR",
      message: "Required param 'name' missing"
    });
  }

  const collection = await NoteCollection.create({
    name, description
  });

  await collection.setUser(user);

  res.send({
    status: "OK",
    id: collection.id
  });
});
