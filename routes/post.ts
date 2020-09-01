import { Router } from "express";

import { db } from "../models";
import { authRequired } from "../util";
import { UserInstance } from "models/users";
import association from "../models/associations";

const router = Router();

/**
 * Get all posts
 */
router.get("/all", authRequired, async (req, res) => {
  const PostModel = db.getModels().Posts;
  const posts = await PostModel.findAll(
    { 
      order: [["created_at", "desc"]],
      include: ["dataContainer", "comments"] 
    });

  res.send(posts);
});

/**
 * Get Post by id
 */
router.get("/id/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const PostModel = db.getModels().Posts;
  const post = await PostModel.findByPk(id, 
    { 
      include: ["dataContainer", "comments", "postReference", "postReferenced", "user", "userReferenced", "tag"]
    });

  if (post) {
    res.send(post);
  } else {
    res.status(404).json([]);
  }
  
});

/**
 * Create new Post
 */
router.post("/", authRequired, async (req, res) => {
  const { text, title } = req.body; 
  if (!text) return res.status(400).send({ message: "Field text not present"});
    
  const PostModel = db.getModels().Posts; 
  return PostModel.create({
    title: title,
    dataContainer: {
      text_content: text
    }
  }).then((post) => {
    return res.send(post);
  }).catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

/**
 * Create comment from post with specific id
 */
router.post("/id/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { text, title, multimedia } = req.body;
  if (!text) return res.status(400).send({ message: "Field text not present"});
  const user = req.user as UserInstance;
  
  const PostModel = db.getModels().Posts;
  const post = PostModel.build({
    title: title,
    parent_post_id: id,
    user_id: user.id,
    dataContainer: {
      text_content: text
    }
  }, {
    include: [ association.getAssociatons().postAssociations.PostDataContainer ]
  });

  const postSaved = await post.save();

  if (multimedia && multimedia.length > 0) {
    const dataContainer = await postSaved.getDataContainer();
    await dataContainer.setMultimedia(multimedia);
  }

  return res.send(postSaved);
});

export default router;