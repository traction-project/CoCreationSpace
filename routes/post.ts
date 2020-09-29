import { Router } from "express";

import { db } from "../models";
import { authRequired, buildCriteria } from "../util";
import { UserInstance } from "models/users";
import association from "../models/associations";
import { TagInstance } from "models/tag";

const router = Router();

/**
 * Get all posts
 */
router.get("/all", authRequired, async (req, res) => {
  const { Posts, DataContainer, Users, Multimedia } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status"]
    }]
  };

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const posts = await Posts.findAll({
    where: {
      parent_post_id: null
    },
    order: [["created_at", "desc"]],
    include: [{
      model: Users,
      as: "user",
      attributes: ["id", "username", "image"]
    }, queryDataContainer, "comments", "tags"]
  });

  const postsJSON = await Promise.all(posts.map(async (post) => {
    const likes = await post.countLikesUsers();
    let postJSON = post.toJSON();

    return {
      likes,
      ...postJSON
    };
  }));

  res.send(postsJSON);
});

/**
 * Get all post from user
 */
router.get("/all/user", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Posts, Users, DataContainer, Multimedia } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status"]
    }]
  };

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const posts = await Posts.findAll({
    where: {
      parent_post_id: null
    } as any,
    include: [{
      model: Users,
      as: "user",
      where: { id: user.id }
    }, queryDataContainer, "comments", "tags"],
    order: [
      ["created_at", "DESC"]
    ]
  });

  res.send(posts);
});

/**
 * Get Post by id
 */
router.get("/id/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;

  const { Posts } = db.getModels();

  const post = await Posts.findByPk(id, {
    include: [
      {
        association: association.getAssociatons().postAssociations.PostDataContainer,
        include: [ association.getAssociatons().datacontainerAssociations.DatacontainerMultimedia ]
      }, "comments", "postReference", "postReferenced", "user", "userReferenced", "tags"
    ]
  });

  if (post) {
    const likes = await post.countLikesUsers();
    const isLiked = await post.hasLikesUser(user);

    let postJSON = post.toJSON();

    const result = {
      likes,
      isLiked,
      ...postJSON
    };

    res.send(result);
  } else {
    res.status(404).json([]);
  }
});

/**
 * Create new Post
 */
router.post("/", authRequired, async (req, res) => {
  const { text, title, multimedia, tags } = req.body;
  if (!text) return res.status(400).send({ message: "Field text not present"});
  const user = req.user as UserInstance;

  const { Posts, Tags } = db.getModels();

  const post = Posts.build({
    title: title,
    user_id: user.id,
    dataContainer: {
      text_content: text
    }
  }, {
    include: [ association.getAssociatons().postAssociations.PostDataContainer, "tags" ]
  });

  const postSaved = await post.save();

  if (multimedia && multimedia.length > 0) {
    const dataContainer = await postSaved.getDataContainer();
    await dataContainer.setMultimedia(multimedia);
  }

  if (tags && tags.length > 0) {
    tags.forEach(async (tag: TagInstance) => {
      const { id, tag_name } = tag;
      const query = id ? { id } : { tag_name: tag_name.toLowerCase() };

      const tagSaved = await Tags.findAll({where: query});

      if (tagSaved && tagSaved.length > 0) {
        await postSaved.addTag(tagSaved[0]);
      } else {
        const newTag = await Tags.create(tag);
        await postSaved.addTag(newTag);
      }
    });
  }

  return res.send(postSaved);
});

/**
 * Create comment from post with specific id
 */
router.post("/id/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { text, multimedia } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Field text not present"});
  }

  const user = req.user as UserInstance;
  const { Posts } = db.getModels();

  const post = Posts.build({
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

/**
 * Like a post from user
 */
router.post("/id/:id/like", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Posts } = db.getModels();

  const post = await Posts.findByPk(id);

  if (post) {
    await post.addLikesUser(user);

    const numLikes = await post.countLikesUsers();
    res.send({ count: numLikes });
  }

});

/**
 * Unlike a post from user
 */
router.post("/id/:id/unlike", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Posts } = db.getModels();

  const post = await Posts.findByPk(id);

  if (post) {
    await post.removeLikesUser(user);

    const numLikes = await post.countLikesUsers();
    res.send({ count: numLikes });
  }

});
export default router;
