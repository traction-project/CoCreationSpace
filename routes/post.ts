import { Router, Request, Response } from "express";

import { db } from "../models";
import { buildCriteria, isUser, getFromEnvironment } from "../util";
import { authRequired } from "../util/middleware";
import { UserInstance } from "../models/user";
import association from "../models/associations";
import { TagInstance } from "models/tag";
import { PostInstance } from "models/post";
import { MediaItemAttributes } from "../models/media_item";

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
    const { Post, User, DataContainer, MediaItem, Thread, Topic, UserGroup } = db.getModels();

    let queryDataContainer = {
      model: DataContainer,
      include: [{
        model: MediaItem,
        attributes: ["status", "id", "type"],
        include: ["emojiReactions"]
      }]
    };

    const criteria = await buildCriteria(req.query, DataContainer);
    queryDataContainer = Object.assign(queryDataContainer, criteria);

    const posts = await Post.findAndCountAll({
      where: {
        parentPostId: null,
        published: publishedOnly
      },
      include: [{
        model: User,
        attributes: ["id", "username", "image"],
        where: { id: user.id }
      }, queryDataContainer, "comments", "tags", {
        model: Thread,
        required: true,
        include: [{
          model: Topic,
          required: true,
          include: [{
            model: UserGroup,
            required: true
          }]
        }]
      }],
      order: [
        ["createdAt", "DESC"]
      ]
    });

    await logSearchQuery(req.query["q"] as string, posts.count, user);

    posts.rows.forEach(post => {
      if (post.user && isUser(post.user)) {
        post.user.image = `${CLOUDFRONT_URL}/${post.user.image}`;
      }
    });

    res.send(posts);
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

  // Get tag, group and interest id to filter by
  const groupId = req.query.group;
  const tagId = req.query.tag;
  const interestId = req.query.interest;

  let queryDataContainer = {
    model: DataContainer,
    include: [{
      model: MediaItem,
      attributes: ["status", "id", "type"],
      include: ["emojiReactions"]
    }]
  };

  const criteria = await buildCriteria(req.query, DataContainer);
  queryDataContainer = Object.assign(queryDataContainer, criteria);

  const groups = (await user.getApprovedUserGroups()).map((group) => group.id);

  const posts = await Post.findAndCountAll({
    where: {
      parentPostId: null,
      published: true
    },
    distinct: true,
    include: [{
      model: User,
      attributes: ["id", "username", "image"]
    }, queryDataContainer, "comments", {
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
          where: (groupId && groupId !== "") ? { id: groupId } : { id: groups }
        }]
      }]
    }],
    order: [
      ["createdAt", "DESC"]
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

    if (post.dataContainer && post.dataContainer instanceof Object) {
      const { mediaItem } = post.dataContainer;

      if (mediaItem && mediaItem.length > 0) {
        post.dataContainer.mediaItem = (mediaItem as Array<MediaItemAttributes>).map(
          (multimedia: MediaItemAttributes) => multimedia.title = `${CLOUDFRONT_URL}/${multimedia.title}`
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
  const { text, title, multimedia, tags, topicId, published } = req.body;

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
    textContent: text,
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
  const { title, description, multimedia, tags, published } = req.body;

  const { Post, DataContainer, Tag } = db.getModels();
  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);
  const dataContainer = await DataContainer.findOne({ where: { post_id: id } as any });

  if (post && dataContainer) {
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
        return tags.find((t: string) => t == existingTag.name) == undefined;
      });

      // Remove tags from post
      await post.removeTags(tagsToRemove);

      // Get tags which are in the submitted list but not in the database
      const tagsToAdd = tags.filter((t: string) => {
        return existingTags.find((existingTag) => t == existingTag.name) == undefined;
      });

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
 */
router.delete("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { Post } = db.getModels();

  const user = req.user as UserInstance;
  const post = await Post.findByPk(id);

  if (post) {
    if (post.userId == user.id || user.isAdmin()) {
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
