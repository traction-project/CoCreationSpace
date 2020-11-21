import * as React from "react";
import { VideoJsPlayer } from "video.js";

import { EmojiReaction } from "public/javascripts/util";
import vjsEmojiAnimation from "./emoji_animation";
import { PostType } from "../post/post";
import vjsTooltip from "./tooltip";
import { Marker } from "./types";

/**
 * Display an animation in the player
 * @param video VideoJsPlayer instance
 * @param emoji Emoji to print in the player
 */
export const addEmojiAnimation = (video: VideoJsPlayer, emoji: EmojiReaction) => {
  const animation = new vjsEmojiAnimation(video, { emoji: emoji.emoji });
  video.addChild(animation);
  setTimeout(() => {
    video.removeChild(animation);
  }, 1000);
};

/**
 * Display a tooltip with a user comment
 * @param video VideoJsPlayer instance
 * @param reaction Emoji to print in the player
 */
export const addTooltip = (video: VideoJsPlayer,reaction: PostType): void => {
  const text = reaction.dataContainer?.text_content;

  if (video && text) {
    const currentTooltip = video.getChildById("vjsTooltip");

    if (currentTooltip) {
      video.removeChild(currentTooltip);
    }
    const tooltip = new vjsTooltip(video, { username: reaction.user.username, text});
    video.addChild(tooltip);
    setTimeout(() => video && video.removeChild(tooltip), 3000);
  }
};

/**
 * Create Markers in the player
 * @param video VideoJsPlayer instance
 * @param markers Markers to print
 * @param playerNode Div element ref that contains the player
 */
export const createMarkers = (video: VideoJsPlayer, markers: Marker[], playerNode: React.RefObject<HTMLDivElement>) => {
  if (video && video.duration() > 0) {
    markers.map(marker => {
      const { type, second, emoji } = marker;

      if (type === "comment") {
        const marker = document.createElement("i");
        marker.classList.add("fas");
        marker.classList.add("fa-comment");
        marker.classList.add("video-marker");
        marker.style.left = `${second * 100 / video.duration()}%`;
        playerNode.current?.querySelector(".vjs-progress-holder")?.appendChild(marker);
      }
      if (type === "emoji") {
        const marker = document.createElement("span");
        marker.classList.add("video-marker");
        if (emoji) {
          marker.innerHTML = emoji;
        }
        marker.style.left = `${second * 100 / video.duration()}%`;
        playerNode.current?.querySelector(".vjs-progress-holder")?.appendChild(marker);
      }
    });
  }
};
