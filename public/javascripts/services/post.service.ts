import { MultimediaItem, PostType } from "../components/post/post";

/**
 * Make a request with the API to get a Post with a specific id
 * @param id Post Id
 */
export const getPostId = async (id: string | number) => {
  const response = await fetch(`/posts/${id}`);

  return response;
};

/**
 * Like or remove like from a post
 * @param id Post Id
 * @param action "like" | "unlike"
 */
export const postLike = async (id: string | number, action: string) => {
  action = action.toLowerCase();
  const response = await fetch(`/posts/${id}/${action}`, {
    method: "POST"
  });

  return response;
};

/**
 * Create new comment of post referenced by id
 * @param id Post Id
 * @param text Text content
 * @param multimedia? Array of numbers that references multimedia files
 * @param second? Player time where the comment was written
 * @param currentItemId? If param 'second' is set, this is the id of the media item that the comment is associated to
 */
export const postComment = async (id: string | number, text: string, multimedia?: Array<string>, second?: number, currentItemId?: string) => {
  const bodyJson = {
    text,
    second,
    currentItemId,
    ...(multimedia && multimedia.length > 0 && {multimedia})
  };

  const response = await fetch(`/posts/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyJson)
  });

  return response;
};

/**
 * Delete the post with the given id and all its children.
 *
 * @param id Post id
 */
export const deletePost = async (id: string) => {
  const respone = await fetch(`/posts/${id}`, {
    method: "DELETE"
  });

  return respone;
};

/**
 * Flattens a tree of comments and returns the comments that are related to the
 * given multimedia item.
 */
export const getCommentsForItem = (comments: Array<PostType>, selectedItem: MultimediaItem): Array<PostType> => {
  return comments.reduce<Array<PostType>>((relatedComments, comment) => {
    return relatedComments.concat(
      (comment.multimediaRef == selectedItem.id) ? comment : []
    ).concat(
      (comment.comments) ? getCommentsForItem(comment.comments, selectedItem) : []
    );
  }, []);
};
