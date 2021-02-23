
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
 */
export const postComment = async (id: string | number, text: string, multimedia?: Array<string>, second?: number) => {
  const bodyJson = {
    text,
    second,
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
