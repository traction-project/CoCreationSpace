import { Router, Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";

import { db } from "../models";
import { isUser, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
import { UserAttributes, UserInstance } from "../models/user";
import association from "../models/associations";
import { TagInstance } from "models/tag";
import { PostInstance, PostAttributes } from "models/post";

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
 * Returns an Express middleware function which will, when called as part of a
 * request, return all posts associated with the current user. The param
 * `publishedOnly` can be used to control whether only published posts or only
 * draft posts should be returned.
 *
 * @param publishedOnly Flag to control whether only published posts should be returned
 * @returns An Express middleware function which returns the current users posts
 */
function getUserPosts(publishedOnly: boolean) {
  return async (req: Request, res: Response) => {
    const user = req.user as UserInstance;
    const { Post, User, DataContainer, MediaItem, Tag, Thread, Topic, UserGroup } = db.getModels();

    // Get tag, group, user and interest id to filter by
    const groupId = req.query.group;
    const tagId = req.query.tag;
    const interestId = req.query.interest;

    // Get desired page number and results per page from query string if present
    // Use defaults otherwise
    const page = (typeof req.query.page == "string") ? parseInt(req.query.page) : 1;
    const perPage = (typeof req.query.perPage == "string") ? parseInt(req.query.perPage) : 15;

    let topLevelConditions: WhereOptions<PostAttributes> = {
      parentPostId: null,
      published: publishedOnly
    };

    if (req.query.q) {
      const query = `%${req.query.q}%`;

      topLevelConditions = {
        ...topLevelConditions,
        [Op.or]: [
          { "$dataContainer.text_content$": { [Op.iLike]: query} },
          { "$post.title$": { [Op.iLike]: query } },
          { "$user.username$": { [Op.iLike]: query } }
        ]
      };
    }

    const posts = await Post.findAndCountAll({
      where: topLevelConditions,
      distinct: true,
      include: [{
        model: User,
        attributes: ["id", "username", "image"],
        where: { id: user.id }
      }, {
        model: User,
        as: "favourites",
        attributes: ["id"],
        required: false,
        where: { id: user.id }
      }, {
        model: DataContainer,
        required: true,
        include: [{
          model: MediaItem,
          attributes: ["status", "id", "type"],
          include: ["emojiReactions"]
        }]
      }, "comments", {
        model: Tag,
        where: (tagId && tagId !== "") ? { id: tagId } : undefined
      }, {
        model: Thread,
        required: true,
        include: [{
          model: Topic,
          required: true,
          where: (interestId && interestId !== "") ? { id: interestId } : undefined,
          include: [{
            model: UserGroup,
            required: true,
            where: (groupId && groupId !== "") ? { id: groupId } : undefined
          }]
        }]
      }],
      order: [
        ["createdAt", "DESC"]
      ],
      limit: perPage,
      offset: (page - 1) * perPage
    });

    const tags = await Tag.findAll({
      attributes: ["id", "name"],
      order: ["name"],
      include: [{
        model: Post,
        required: true,
        attributes: [],
        where: { published: publishedOnly },
        include: [{
          model: User,
          required: true,
          attributes: [],
          where: { id: user.id }
        }]
      }]
    });

    const interests = await Topic.findAll({
      attributes: ["id", "title"],
      order: ["title"],
      include: [{
        model: Thread,
        required: true,
        attributes: [],
        include: [{
          model: Post,
          required: true,
          attributes: [],
          where: { published: publishedOnly },
          include: [{
            model: User,
            required: true,
            attributes: [],
            where: { id: user.id }
          }]
        }]
      }]
    });

    const groups = await user.getApprovedUserGroups();

    await logSearchQuery(req.query["q"] as string, posts.count, user);

    posts.rows.forEach(post => {
      if (post.user && isUser(post.user)) {
        post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
      }
    });

    res.send({ posts, tags, groups, interests });
  };
}

/**
 * Get all published posts from user
 */
router.get("/all/user", authRequired, getUserPosts(true));

/**
 * Get all draft posts from user
 */
router.get("/draft/user", authRequired, getUserPosts(false));

/**
 * Get all published posts for the groups the current user is a member of.
 */
router.get("/all/group", authRequired, async (req, res) => {
  const user = req.user as UserInstance;
  const { Post, User, UserGroup, DataContainer, MediaItem, Tag, Thread, Topic } = db.getModels();

  // Get desired page number and results per page from query string if present
  // Use defaults otherwise
  const page = (typeof req.query.page == "string") ? parseInt(req.query.page) : 1;
  const perPage = (typeof req.query.perPage == "string") ? parseInt(req.query.perPage) : 15;

  // Get tag, group, user and interest id to filter by
  const groupId = req.query.group;
  const tagId = req.query.tag;
  const interestId = req.query.interest;
  const userId = req.query.user;

  const groups = await user.getApprovedUserGroups();

  let topLevelConditions: WhereOptions<PostAttributes> = {
    parentPostId: null,
    published: true
  };

  if (req.query.q) {
    const query = `%${req.query.q}%`;

    topLevelConditions = {
      ...topLevelConditions,
      [Op.or]: [
        { "$dataContainer.text_content$": { [Op.iLike]: query} },
        { "$post.title$": { [Op.iLike]: query } },
        { "$user.username$": { [Op.iLike]: query } }
      ]
    };
  }

  const posts = await Post.findAndCountAll({
    where: topLevelConditions,
    distinct: true,
    include: [{
      model: User,
      required: true,
      where: (userId && userId !== "") ? { id: userId } : undefined,
      attributes: ["id", "username", "image"]
    }, {
      model: User,
      as: "favourites",
      attributes: ["id"],
      required: false,
      where: { id: user.id }
    }, {
      model: DataContainer,
      required: true,
      include: [{
        model: MediaItem,
        attributes: ["status", "id", "type"],
        include: ["emojiReactions"]
      }]
    }, "comments", {
      model: Tag,
      where: (tagId && tagId !== "") ? { id: tagId } : undefined
    }, {
      model: Thread,
      required: true,
      include: [{
        model: Topic,
        required: true,
        where: (interestId && interestId !== "") ? { id: interestId } : undefined,
        include: [{
          model: UserGroup,
          where: (groupId && groupId !== "") ? { id: groupId } : { id: groups.map((g) => g.id) }
        }]
      }]
    }],
    order: [
      ["createdAt", "DESC"]
    ],
    limit: perPage,
    offset: (page - 1) * perPage
  });

  const tags = await Tag.findAll({
    attributes: ["id", "name"],
    order: ["name"],
    include: [{
      model: Post,
      required: true,
      attributes: [],
      include: [{
        model: Thread,
        attributes: [],
        required: true,
        include: [{
          model: Topic,
          attributes: [],
          required: true,
          include: [{
            model: UserGroup,
            attributes: [],
            where: { id: groups.map((g) => g.id) }
          }]
        }]
      }]
    }]
  });

  const interests = await Topic.findAll({
    attributes: ["id", "title"],
    order: ["title"],
    include: [{
      model: UserGroup,
      attributes: [],
      where: { id: groups.map((g) => g.id) }
    }, {
      model: Thread,
      attributes: [],
      required: true
    }]
  });

  await logSearchQuery(req.query["q"] as string, posts.count, user);

  const mappedPostRows = await Promise.all(posts.rows.map(async (p) => {
    const post = p.toJSON() as PostAttributes;
    const user = post.user as UserAttributes;

    return {
      ...post,
      user: {
        ...user,
        image: `${CLOUDFRONT_URL}/${user.image}`
      },
      commentCount: await p.countAllComments()
    };
  }));

  res.send({
    posts: {
      count: posts.count,
      rows: mappedPostRows
    },
    tags,
    groups,
    interests
  });
});

/**
 * Get Post by id
 */
router.get("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const user = req.user as UserInstance;

  const { Post, DataContainer, MediaItem, Topic, Thread, UserGroup } = db.getModels();

  const post = await Post.findByPk(id, {
    include: [
      {
        model: Thread,
        required: true,
        include: [{
          model: Topic,
          required: true,
          include: [{
            model: UserGroup,
          }]
        }]
      },
      {
        model: DataContainer,
        include: [{
          model: MediaItem,
          attributes: ["status", "id", "type", "title", "file"],
          include: ["emojiReactions", "videoChapters"]
        }]
      }, {
        model: Post,
        as: "comments",
        include: ["dataContainer", "user"],
      }, "postReferences", "postReferenced", "user", "userReferenced", "tags"
    ],
    order: [["comments", "createdAt", "asc"]]
  });

  if (post) {
    const likes = await post.countLikedUsers();
    const isLiked = await post.hasLikedUser(user);

    if (post.user && isUser(post.user)) {
      post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
    }

    if (post.dataContainer) {
      post.dataContainer.mediaItems?.forEach((mediaItem) => {
        mediaItem.title = `${CLOUDFRONT_URL}/${mediaItem.title}`;
      });
    }

    const postJSON: any = post.toJSON();

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

  const { Post, DataContainer, MediaItem } = db.getModels();

  let post: PostInstance | null;
  let parentPostId: string | undefined = id;

  do {
    post = await Post.findByPk(parentPostId, {
      include: [
        {
          model: DataContainer,
          include: [{
            model: MediaItem,
            attributes: ["status", "id", "type"],
            include: ["emojiReactions", "videoChapters"]
          }]
        }, {
          model: Post,
          as: "comments",
          include: ["dataContainer", "user"],
        }, "postReferences", "postReferenced", "user", "userReferenced", "tags"
      ],
      order: [["comments", "createdAt", "desc"]],
    });

    if (post == null) {
      return res.status(404).json([]);
    }

    parentPostId = post.parentPostId;
  } while (parentPostId);

  if (post) {
    const likes = await post.countLikedUsers();
    const isLiked = await post.hasLikedUser(user);

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
  const { description, title, multimedia, tags, topicId, published } = req.body;

  const user = req.user as UserInstance;
  const { Post, Tag, Thread, DataContainer } = db.getModels();

  const thread = await Thread.create({
    title: title,
    topicId: topicId
  });

  const post = await Post.create({
    title: title,
    userId: user.id,
    threadId: thread.id,
    published
  });

  const dataContainer = await DataContainer.create({
    textContent: description,
    postId: post.id
  });

  if (multimedia && multimedia.length > 0) {
    await dataContainer.setMediaItems(multimedia);
  }

  if (tags && tags.length > 0) {
    tags.forEach(async (tag: TagInstance) => {
      const { id, name } = tag;
      const query = id ? { id } : { name: name.toLowerCase() };

      const tagSaved = await Tag.findAll({where: query});

      if (tagSaved && tagSaved.length > 0) {
        await post.addTag(tagSaved[0]);
      } else {
        const newTag = await Tag.create(tag);
        await post.addTag(newTag);
      }
    });
  }

  return res.send(post);
});

/**
 * Edit the post with the given ID
 */
router.post("/:id/edit", authRequired, async (req, res) => {
  const { id } = req.params;
  const { title, description, multimedia, tags, published, topicId } = req.body;

  const { Post, DataContainer, Tag } = db.getModels();
  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);
  const dataContainer = await DataContainer.findOne({ where: { postId: id }});

  if (post && dataContainer) {
    const thread = await post.getThread();
    thread.topicId = topicId;
    await thread.save();

    if (post.userId != user.id && !user.isAdmin()) {
      return res.status(401).send({
        status: "ERR",
        message: "Not authorized"
      });
    }

    if (title) {
      post.title = title;
    }

    post.published = published;
    await post.save();

    if (description) {
      dataContainer.textContent = description;
      await dataContainer.save();
    }

    if (tags) {
      // Get post's tags
      const existingTags = await post.getTags();

      // Get tags which are not in the submitted tags list
      const tagsToRemove = existingTags.filter((existingTag) => {
        return tags.find((t: { name: string }) => t.name == existingTag.name) == undefined;
      });

      // Remove tags from post
      await post.removeTags(tagsToRemove);

      // Get tags which are in the submitted list but not in the database
      const tagsToAdd = tags.filter((t: { name: string }) => {
        return existingTags.find((existingTag) => t.name == existingTag.name) == undefined;
      }).map((t: { name: string }) => t.name);

      tagsToAdd.forEach(async (tagToAdd: string) => {
        // Try to find pre-existing tag with same name
        const preexistingTag = await Tag.findOne({ where: { name: tagToAdd } });

        if (preexistingTag) {
          // Associate pre-existing tag with post if possible
          await post.addTag(preexistingTag);
        } else {
          // Otherwise create new tag and associate it with post
          const newTag = await Tag.create({ name: tagToAdd });
          await post.addTag(newTag);
        }
      });
    }

    if (multimedia) {
      await dataContainer.setMediaItems(multimedia);
      await dataContainer.save();
    }

    return res.send({
      status: "OK",
      id: post.id
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
    parentPostId: id,
    userId: user.id,
    threadId: parentPost.threadId,
    multimediaRef: currentItemId,
    dataContainer: DataContainer.build({
      textContent: text
    }),
    second
  }, {
    include: [ association.getAssociatons().postAssociations.PostDataContainer ]
  });

  const postSaved = await post.save();
  if (multimedia && multimedia.length > 0) {
    const dataContainer = await postSaved.getDataContainer();
    await dataContainer.setMediaItems(multimedia);
  }

  const result = Object.assign(postSaved.toJSON(), {user: user.toJSON()});
  return res.send(result);
});

/**
 * Deletes the post associated to the given id. Also deletes all child posts
 * recursively. Returns HTTP 404 if the post with the given id cannot be found.
 *
 * If, as a result of this operation, the associated thread record loses all
 * children, it is also deleted.
 */
router.delete("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { Post } = db.getModels();

  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);

  if (post) {
    if (post.userId == user.id || user.isAdmin()) {
      // Destroy post and all its children and thread if it has become empty
      await post.destroyWithCommentsAndThread();

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
 * Add post given by ID to current user's favourites
 */
router.post("/:id/favourite", authRequired, async (req, res) => {
  const { Post } = db.getModels();
  const { id } = req.params;
  const user = req.user as UserInstance;

  const post = await Post.findByPk(id);

  if (!post) {
    return res.status(404).send({
      status: "ERR",
      message: "Post not found"
    });
  }

  await user.addFavourite(post);

  res.send({
    status: "OK"
  });
});

/**
 * Remove post given by ID from current user's favourites
 */
router.delete("/:id/favourite", authRequired, async (req, res) => {
  const { Post } = db.getModels();
  const { id } = req.params;
  const user = req.user as UserInstance;

  const post = await Post.findByPk(id);

  if (!post) {
    return res.status(404).send({
      status: "ERR",
      message: "Post not found"
    });
  }

  await user.removeFavourite(post);

  res.send({
    status: "OK"
  });
});

/**
 * Check whether a given post is favourited by the current user
 */
router.get("/:id/favourite", authRequired, async (req, res) => {
  const { Post } = db.getModels();
  const { id } = req.params;
  const user = req.user as UserInstance;

  const post = await Post.findByPk(id);

  if (!post) {
    return res.status(404).send({
      status: "ERR",
      message: "Post not found"
    });
  }

  res.send({
    status: "OK",
    favourite: await user.hasFavourite(post)
  });
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
    await post.addLikedUser(user);

    const numLikes = await post.countLikedUsers();
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
    await post.removeLikedUser(user);

    const numLikes = await post.countLikedUsers();
    res.send({ count: numLikes });
  }

});

export default router;
