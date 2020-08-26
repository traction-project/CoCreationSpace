import { Router } from "express";
import { db } from "../models";

const router = Router();

/**
 * Get all posts
 */
router.get("/all", async (req, res) => {
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
router.get("/id/:id", async (req, res) => {
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
router.post("/", async (req, res) => {
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
router.post("/id/:id", async (req, res) => {
  const { id } = req.params;
  const { text, title } = req.body;
  if (!text) return res.status(400).send({ message: "Field text not present"});
    
  const PostModel = db.getModels().Posts;
  return PostModel.create({
    title: title,
    dataContainer: {
      text_content: text
    },
    parent_post_id: id
  }).then((post) => {
    return res.send(post);
  }).catch((error) => {
    return res.status(500).send({ message: error.message });
  });
});

export default router;