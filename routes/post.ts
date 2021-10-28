import { Router } from "express";

import { db } from "../models";
import { buildCriteria, isUser, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
import { UserInstance } from "models/user";
import association from "../models/associations";
import { TagInstance } from "models/tag";
import { PostInstance } from "models/post";
import { MultimediaAttributes } from "models/multimedia";

const [ CLOUDFRONT_URL ] = getFromEnvironment("CLOUDFRONT_URL");
const router = Router();

/**
 * Log the given search query to the database.
 *
 * @param query Search query to be logged
 */
async function logSearchQuery(query: string | undefined, resultcount: number, user: UserInstance) {
  if (query) {
    const { SearchQuery } = db.getModels();

    const searchQuery = await SearchQuery.create({ query, resultcount });
    await searchQuery.setUser(user);
  }
}

/**
 * Get all post from user
 */
router.get("/all/user", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Post, User, DataContainer, Multimedia, Thread, Topic, UserGroup } = db.getModels();

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status", "id", "type"],
      include: ["emojiReactions"]
    }]
  };

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const posts = await Post.findAndCountAll({
    where: {
      parent_post_id: null
    } as any,
    include: [{
      model: User,
      as: "user",
      attributes: ["id", "username", "image"],
      where: { id: user.id }
    }, queryDataContainer, "comments", "tags", {
      model: Thread,
      as: "thread",
      required: true,
      include: [{
        model: Topic,
        as: "topic",
        required: true,
        include: [{
          model: UserGroup,
          as: "userGroup",
          required: true
        }]
      }]
    }],
    order: [
      ["created_at", "DESC"]
    ]
  });

  await logSearchQuery(req.query["q"] as string, posts.count, user);

  posts.rows.forEach(post => {
    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }
  });

  res.send(posts);
});

/**
 * Get all posts for the groups the current user is a member of.
 */
router.get("/all/group", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Post, User, UserGroup, DataContainer, Multimedia, Tag, Thread, Topic } = db.getModels();

  // Get desired page number and results per page from query string if present
  // Use defaults otherwise
  const page = (typeof req.query.page == "string") ? parseInt(req.query.page) : 1;
  const perPage = (typeof req.query.perPage == "string") ? parseInt(req.query.perPage) : 15;

  // Get tag, group and interest id to filter by
  const groupId = req.query.group;
  const tagId = req.query.tag;
  const interestId = req.query.interest;

  let queryDataContainer = {
    model: DataContainer,
    as: "dataContainer",
    include: [{
      model: Multimedia,
      as: "multimedia",
      attributes: ["status", "id", "type"],
      include: ["emojiReactions"]
    }]
  };

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const groups = (await user.getUserGroups()).map((group) => group.id);

  const posts = await Post.findAndCountAll({
    where: {
      parent_post_id: null
    } as any,
    distinct: true,
    include: [{
      model: User,
      as: "user",
      attributes: ["id", "username", "image"]
    }, queryDataContainer, "comments", {
      model: Tag,
      as: "tags",
      where: (tagId && tagId !== "") ? { id: tagId } : undefined
    }, {
      model: Thread,
      as: "thread",
      required: true,
      include: [{
        model: Topic,
        as: "topic",
        required: true,
        where: (interestId && interestId !== "") ? { id: interestId } : undefined,
        include: [{
          model: UserGroup,
          as: "userGroup",
          where: (groupId && groupId !== "") ? { id: groupId } : { id: groups }
        }]
      }]
    }],
    order: [
      ["created_at", "DESC"]
    ],
    limit: perPage,
    offset: (page - 1) * perPage
  });

  await logSearchQuery(req.query["q"] as string, posts.count, user);

  posts.rows.forEach(post => {
    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }
  });

  res.send(posts);
});

/**
 * Get Post by id
 */
router.get("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;

  const { Post, DataContainer, Multimedia, Topic, Thread, UserGroup } = db.getModels();

  const post = await Post.findByPk(id, {
    include: [
      {
        model: Thread,
        as: "thread",
        required: true,
        include: [{
          model: Topic,
          as: "topic",
          required: true,
          include: [{
            model: UserGroup,
            as: "userGroup"
          }]
        }]
      },
      {
        model: DataContainer,
        as: "dataContainer",
        include: [{
          model: Multimedia,
          as: "multimedia",
          attributes: ["status", "id", "type", "title", "file"],
          include: ["emojiReactions"]
        }]
      }, {
        model: Post,
        as: "comments",
        include: ["dataContainer", "user"],
      }, "postReference", "postReferenced", "user", "userReferenced", "tags"
    ],
    order: [["comments", "created_at", "asc"]],
  });

  if (post) {
    const likes = await post.countLikesUsers();
    const isLiked = await post.hasLikesUser(user);

    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }

    if (post.dataContainer && post.dataContainer instanceof Object) {
      const { multimedia } = post.dataContainer;

      if (multimedia && multimedia.length > 0) {
        post.dataContainer.multimedia = (multimedia as Array<MultimediaAttributes>).map(
          (multimedia: MultimediaAttributes) => multimedia.title = `${CLOUDFRONT_URL}/${multimedia.title}`
        );
      }
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
router.get("/:id/parent", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;

  const { Post, DataContainer, Multimedia } = db.getModels();

  let post: PostInstance | null;
  let parentPostId: string | undefined = id;

  do {
    post = await Post.findByPk(parentPostId, {
      include: [
        {
          model: DataContainer,
          as: "dataContainer",
          include: [{
            model: Multimedia,
            as: "multimedia",
            attributes: ["status", "id", "type"],
            include: ["emojiReactions"]
          }]
        }, {
          model: Post,
          as: "comments",
          include: ["dataContainer", "user"],
        }, "postReference", "postReferenced", "user", "userReferenced", "tags"
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

  const user = req.user as UserInstance;
  const { Post, Tag, Thread, DataContainer } = db.getModels();

  const thread = await Thread.create({
    th_title: title,
    topic_id: topicId
  });

  const post = Post.build({
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

      const tagSaved = await Tag.findAll({where: query});

      if (tagSaved && tagSaved.length > 0) {
        await postSaved.addTag(tagSaved[0]);
      } else {
        const newTag = await Tag.create(tag);
        await postSaved.addTag(newTag);
      }
    });
  }

  return res.send(postSaved);
});

/**
 * Edit the post with the given ID
 */
router.post("/:id/edit", authRequired, async (req, res) => {
  const { id } = req.params;
  const { title, description, multimedia, tags } = req.body;

  const { Post, DataContainer, Tag } = db.getModels();
  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);
  const dataContainer = await DataContainer.findOne({ where: { post_id: id } as any });

  if (post && dataContainer) {
    if (post.user_id != user.id && !user.isAdmin()) {
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

    if (tags) {
      // Get post's tags
      const existingTags = await post.getTags();

      // Get tags which are not in the submitted tags list
      const tagsToRemove = existingTags.filter((existingTag) => {
        return tags.find((t: string) => t == existingTag.tag_name) == undefined;
      });

      // Remove tags from post
      await post.removeTags(tagsToRemove);

      // Get tags which are in the submitted list but not in the database
      const tagsToAdd = tags.filter((t: string) => {
        return existingTags.find((existingTag) => t == existingTag.tag_name) == undefined;
      });

      tagsToAdd.forEach(async (tagToAdd: string) => {
        // Try to find pre-existing tag with same name
        const preexistingTag = await Tag.findOne({ where: { tag_name: tagToAdd } });

        if (preexistingTag) {
          // Associate pre-existing tag with post if possible
          await post.addTag(preexistingTag);
        } else {
          // Otherwise create new tag and associate it with post
          const newTag = await Tag.create({ tag_name: tagToAdd });
          await post.addTag(newTag);
        }
      });
    }

    if (multimedia) {
      await dataContainer.setMultimedia(multimedia);
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
router.post("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { text, multimedia, second, currentItemId } = req.body;

  if (!text) {
    return res.status(400).send({ message: "Field text not present"});
  }

  const user = req.user as UserInstance;
  const { Post, DataContainer } = db.getModels();

  const parentPost = await Post.findByPk(id);

  if (!parentPost) {
    return res.status(400).send({ message: "Parent post not found" });
  }

  const post = Post.build({
    parent_post_id: id,
    user_id: user.id,
    thread_id: parentPost.thread_id,
    multimedia_ref: currentItemId,
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
 * Deletes the post associated to the given id. Also deletes all child posts
 * recursively. Returns HTTP 404 if the post with the given id cannot be found.
 */
router.delete("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { Post } = db.getModels();

  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);

  if (post) {
    if (post.user_id == user.id || user.isAdmin()) {
      await post.destroyWithComments();

      return res.send({
        status: "OK"
      });
    }

    return res.status(400).send({
      status: "ERR",
      message: "Not allowed to delete post"
    });
  } else {
    res.status(404).send({
      status: "ERR",
      message: "Post not found"
    });
  }
});

/**
 * Like a post from user
 */
router.post("/:id/like", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Post } = db.getModels();

  const post = await Post.findByPk(id);

  if (post) {
    await post.addLikesUser(user);

    const numLikes = await post.countLikesUsers();
    res.send({ count: numLikes });
  }

});

/**
 * Unlike a post from user
 */
router.post("/:id/unlike", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;
  const { Post } = db.getModels();

  const post = await Post.findByPk(id);

  if (post) {
    await post.removeLikesUser(user);

    const numLikes = await post.countLikesUsers();
    res.send({ count: numLikes });
  }

});

export default router;
