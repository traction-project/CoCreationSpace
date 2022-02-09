import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util/middleware";
import { UserInstance } from "../models/user";

const router = Router();

/**
 * Returns all collections associated to the current user.
 */
router.get("/collections", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  res.send(await user.getNoteCollections({ include: ["mediaItems"] }));
});

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

/**
 * Updates an existing collection by optionally passing name or description in
 * a JSON object in the the POST body. The function also verifies that the given
 * collection is owned by the current user.
 */
router.post("/collection/:id", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { id } = req.params;
  const { name, description } = req.body;

  const { NoteCollection } = db.getModels();
  const collection = await NoteCollection.findOne({
    where: {
      id, user_id: user.id
    }
  });

  if (!collection) {
    return res.status(400).send({
      status: "ERR",
      message: "No such collection"
    });
  }

  if (name) {
    collection.name = name;
  }

  if (description) {
    collection.description = description;
  }

  await collection.save();

  res.send({
    status: "OK"
  });
});

/**
 * Retrieve the note collection with the given ID, provided it belongs to the
 * current user.
 */
router.get("/collection/:id", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { id } = req.params;

  const { NoteCollection } = db.getModels();

  const collection = await NoteCollection.findOne({
    where: {
      id, user_id: user.id
    },
    include: ["mediaItems"]
  });

  if (!collection) {
    return res.status(404).send({
      status: "ERR",
      message: "No such collection"
    });
  }

  res.send(collection);
});

/**
 * Deletes the note collection with the given ID, provided it belongs to the
 * current user.
 */
router.delete("/collection/:id", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { id } = req.params;

  const { NoteCollection } = db.getModels();

  const collection = await NoteCollection.findOne({
    where: {
      id, user_id: user.id
    },
    include: ["mediaItems"]
  });

  if (!collection) {
    return res.status(400).send({
      status: "ERR",
      message: "No such collection"
    });
  }

  await collection.destroy();

  res.send({
    status: "OK"
  });
});

/**
 * Add the media item given by `mediaItemId` to the collection given by
 * `collectionId`. The function verifies that the collection belongs to the
 * current user before adding the media item to the collection.
 */
router.post("/add/:collectionId/:mediaItemId", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { collectionId, mediaItemId } = req.params;

  const { NoteCollection, MediaItem } = db.getModels();

  const noteCollection = await NoteCollection.findOne({
    where: {
      id: collectionId, user_id: user.id
    }
  });

  if (!noteCollection) {
    return res.status(404).send({
      status: "ERR",
      message: "No such collection"
    });
  }

  const mediaItem = await MediaItem.findByPk(mediaItemId);

  if (!mediaItem) {
    return res.status(404).send({
      status: "ERR",
      message: "No such media item"
    });
  }

  await noteCollection.addMediaItem(mediaItem);

  res.send({
    status: "OK"
  });
});

/**
 * Remove the media item given by `mediaItemId` from the collection given by
 * `collectionId`. The function verifies that the collection belongs to the
 * current user before removing the media item from the collection.
 */
router.post("/remove/:collectionId/:mediaItemId", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { collectionId, mediaItemId } = req.params;

  const { NoteCollection, MediaItem } = db.getModels();

  const noteCollection = await NoteCollection.findOne({
    where: {
      id: collectionId, user_id: user.id
    }
  });

  if (!noteCollection) {
    return res.status(404).send({
      status: "ERR",
      message: "No such collection"
    });
  }

  const mediaItem = await MediaItem.findByPk(mediaItemId);

  if (!mediaItem) {
    return res.status(404).send({
      status: "ERR",
      message: "No such media item"
    });
  }

  await noteCollection.removeMediaItem(mediaItem);

  res.send({
    status: "OK"
  });
});

export default router;
