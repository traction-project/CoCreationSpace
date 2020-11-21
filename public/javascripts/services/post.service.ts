
/**
 * Make a request with the API to get a Post with a specific id
 * @param id Post Id
 */
export const getPostId = async (id: string | number) => {
  const URL = `/posts/id/${id}`;
  const response = await fetch(URL);

  return response;
};

/**
 * Like or remove like from a post
 * @param id Post Id
 * @param action "like" | "unlike"
 */
export const postLike = async (id: string | number, action: string) => {
  action = action.toLowerCase();
  const URL = `/posts/id/${id}/${action}`;
  const request = { method: "POST" };

  const response = await fetch(URL, request);

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
  const URL = `/posts/id/${id}`;
  const headers = new Headers();
  headers.append("Content-Type", "application/json");
  const bodyJson = {
    text,
    second,
    ...(multimedia && multimedia.length > 0 && {multimedia})
  };
  const body = JSON.stringify(bodyJson);
  const request =  {
    method: "POST",
    headers,
    body
  };

  const response = await fetch(URL, request);

  return response;
};

/**
 * Send a emoji reaction from a post
 * @param id Post Id
 * @param emoji Emoji string
 * @param second Player current time
 */
export const postEmojiReaction = async (id: string | number, emoji: string, second: number) => {
  return await fetch(`/posts/id/${id}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emoji, second
    })
  });
};
