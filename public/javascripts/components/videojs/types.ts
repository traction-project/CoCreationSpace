/**
 * Marker reactions in the player progress bar
 */
export type Marker = {
    type: "emoji" | "comment";
    second: number;
    emoji?: string;
};