/**
 * Marker reactions in the player progress bar
 */
export interface Marker {
    type: "emoji" | "comment";
    second: number;
    emoji?: string;
}
