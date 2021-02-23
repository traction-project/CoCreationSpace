/**
 * Add an emoji reaction to a multimedia item
 *
 * @param id Media item Id
 * @param emoji Emoji string
 * @param second Player current time
 */
export const postEmojiReaction = async (id: string | number, emoji: string, second: number) => {
  return await fetch(`/media/${id}/reaction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emoji, second
    })
  });
};
