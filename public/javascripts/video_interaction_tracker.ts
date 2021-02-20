interface VideoInteraction {
  type: "play" | "pause" | "end" | "seek" | "fullscreen",
  timestamp: number;
}

export interface VideoInteractionTracker {
  onPlay(timestamp: number): void;
  onPause(timestamp: number): void;
  onSeek(timestamp: number): void;
  onEnd(timestamp: number): void;
  onFullscreen(timestamp: number): void;
}

export class UserVideoInteractionTracker implements VideoInteractionTracker {
  public constructor(private endpoint: string) {
  }

  public onPlay(timestamp: number) {
    this.sendInteraction({
      type: "play",
      timestamp
    });
  }

  public onPause(timestamp: number) {
    this.sendInteraction({
      type: "pause",
      timestamp
    });
  }

  public onSeek(timestamp: number) {
    this.sendInteraction({
      type: "seek",
      timestamp
    });
  }

  public onEnd(timestamp: number) {
    this.sendInteraction({
      type: "play",
      timestamp
    });
  }

  public onFullscreen(timestamp: number) {
    this.sendInteraction({
      type: "fullscreen",
      timestamp
    });
  }

  private sendInteraction(interaction: VideoInteraction) {
    console.log("Sending interaction:", interaction);

    fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(interaction)
    });
  }
}
