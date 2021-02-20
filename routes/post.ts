import { Router } from "express";

import { db } from "../models";
import { buildCriteria, isUser, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
import { UserInstance } from "models/users";
import association from "../models/associations";
import { TagInstance } from "models/tag";
import { PostInstance } from "models/post";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");
const router = Router();

/**
 * Log the given search query to the database.
 *
 * @param query Search query to be logged
 */
async function logSearchQuery(query: string | undefined, user: UserInstance) {
  if (query) {
    const { SearchQuery } = db.getModels();

    const searchQuery = await SearchQuery.create({ query });
    await searchQuery.setUser(user);
  }
}

/**
 * Get all posts
 */
router.get("/all", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Posts, DataContainer, Users, Multimedia, Threads } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status", "id", "type"]
    }]
  };

  await logSearchQuery(req.query["q"] as string, user);

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
    }, queryDataContainer, "comments", "tags", "emojiReactions", {
      model: Threads,
      as: "thread",
      include: ["topic"]
    }]
  });

  posts.forEach(post => {
    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }
  });

  const postsJSON = await Promise.all(posts.map(async (post) => {
    const likes = await post.countLikesUsers();
    const postJSON = post.toJSON();

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
  const { Posts, Users, DataContainer, Multimedia, Threads } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status", "id", "type"]
    }]
  };

  await logSearchQuery(req.query["q"] as string, user);

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const posts = await Posts.findAll({
    where: {
      parent_post_id: null
    } as any,
    include: [{
      model: Users,
      as: "user",
      attributes: ["id", "username", "image"],
      where: { id: user.id }
    }, queryDataContainer, "comments", "tags", "emojiReactions", {
      model: Threads,
      as: "thread",
      include: ["topic"]
    }],
    order: [
      ["created_at", "DESC"]
    ]
  });

  posts.forEach(post => {
    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }
  });

  res.send(posts);
});

/**
 * Get all posts for the groups the current user is a member of.
 */
router.get("/all/group", async (req, res) => {
  const user = req.user as UserInstance;
  const { Posts, Users, UserGroup, DataContainer, Multimedia, Threads } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status", "id", "type"]
    }]
  };

  await logSearchQuery(req.query["q"] as string, user);

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const groups = (await user.getUserGroups()).map((group) => group.id);

  const posts = await Posts.findAll({
    where: {
      parent_post_id: null
    } as any,
    include: [{
      model: Users,
      as: "user",
      attributes: ["id", "username", "image"],
      required: true,
      include: [{
        model: UserGroup,
        as: "userGroups",
        where: { id: groups }
      }]
    }, queryDataContainer, "comments", "tags", "emojiReactions", {
      model: Threads,
      as: "thread",
      include: ["topic"]
    }],
    order: [
      ["created_at", "DESC"]
    ]
  });

  posts.forEach(post => {
    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }
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
      }, {
        model: Posts,
        as: "comments",
        include: ["dataContainer", "user"],
      }, "postReference", "postReferenced", "user", "userReferenced", "tags", "emojiReactions"
    ],
    order: [["comments","created_at", "desc"]],
  });

  if (post) {
    const likes = await post.countLikesUsers();
    const isLiked = await post.hasLikesUser(user);

    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }

    const postJSON = post.toJSON();
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
 * Get topmost parent of post with given ID
 */
router.get("/id/:id/parent", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;

  const { Posts } = db.getModels();

  let post: PostInstance | null;
  let parentPostId: string | undefined = id;

  do {
    post = await Posts.findByPk(parentPostId, {
      include: [
        {
          association: association.getAssociatons().postAssociations.PostDataContainer,
          include: [ association.getAssociatons().datacontainerAssociations.DatacontainerMultimedia ]
        }, {
          model: Posts,
          as: "comments",
          include: ["dataContainer", "user"],
        }, "postReference", "postReferenced", "user", "userReferenced", "tags", "emojiReactions"
      ],
      order: [["comments","created_at", "desc"]],
    });

    if (post == null) {
      return res.status(404).json([]);
    }

    parentPostId = post.parent_post_id;
  } while (parentPostId);

  if (post) {
    const likes = await post.countLikesUsers();
    const isLiked = await post.hasLikesUser(user);

    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }

    const postJSON = post.toJSON();
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
  const { text, title, multimedia, tags, topicId } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Field text not present"});
  }

  const user = req.user as UserInstance;
  const { Posts, Tags, Threads, DataContainer } = db.getModels();

  const thread = await Threads.create({
    th_title: title,
    topic_id: topicId
  });

  const post = Posts.build({
    title: title,
    user_id: user.id,
    thread_id: thread.id,
    dataContainer: DataContainer.build({
      text_content: text
    })
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

router.post("/id/:id/edit", authRequired, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  const { Posts, DataContainer } = db.getModels();
  const user = req.user as UserInstance;
  const post = await Posts.findByPk(id);
  const dataContainer = await DataContainer.findOne({ where: { post_id: id } as any });

  if (post && dataContainer) {
    if (post.user_id != user.id) {
      return res.status(401).send({
        status: "ERR",
        message: "Not authorized"
      });
    }

    if (title) {
      post.title = title;
      await post.save();
    }

    if (description) {
      dataContainer.text_content = description;
      await dataContainer.save();
    }

    return res.send({
      status: "OK"
    });
  }

  return res.status(404).send({
    status: "ERR",
    message: "Post not found"
  });
});

/**
 * Create comment from post with specific id
 */
router.post("/id/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { text, multimedia, second } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Field text not present"});
  }

  const user = req.user as UserInstance;
  const { Posts, DataContainer } = db.getModels();

  const parentPost = await Posts.findByPk(id);

  if (!parentPost) {
    return res.status(400).send({ message: "Parent post not found" });
  }

  const post = Posts.build({
    parent_post_id: id,
    user_id: user.id,
    thread_id: parentPost.thread_id,
    dataContainer: DataContainer.build({
      text_content: text
    }),
    second
  }, {
    include: [ association.getAssociatons().postAssociations.PostDataContainer ]
  });

  const postSaved = await post.save();
  if (multimedia && multimedia.length > 0) {
    const dataContainer = await postSaved.getDataContainer();
    await dataContainer.setMultimedia(multimedia);
  }

  const result = Object.assign(postSaved.toJSON(), {user: user.toJSON()});
  return res.send(result);
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

/**
 * Reaction with emoji a post from user
 */
router.post("/id/:id/reaction", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { emoji, second } = req.body;
  const { Posts, EmojiReactions } = db.getModels();

  const post = await Posts.findByPk(id);

  if (post && user && user.id) {
    const reaction = await EmojiReactions.create({
      emoji,
      second,
      post_id: id,
      user_id: user.id
    });

    return res.send(reaction);
  } else {
    return res.status(400).send({ message: "Post not found" });
  }
});

export default router;
