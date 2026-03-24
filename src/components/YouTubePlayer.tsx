import { useEffect, useRef, useCallback } from "react";

interface Props {
  youtubeUrl: string;
  startSeconds?: number;
  onProgress?: (seconds: number) => void;
  onCompleted?: () => void;
}

function extractVideoId(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    return u.searchParams.get("v") || url;
  } catch {
    return url;
  }
}

export function YouTubePlayer({ youtubeUrl, startSeconds = 0, onProgress, onCompleted }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<number>();
  const completedRef = useRef(false);

  const videoId = extractVideoId(youtubeUrl);

  const clearInterval_ = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  };

  const onStateChange = useCallback((event: any) => {
    const YT = (window as any).YT;
    if (!YT) return;

    if (event.data === YT.PlayerState.PLAYING) {
      clearInterval_();
      intervalRef.current = window.setInterval(() => {
        if (playerRef.current?.getCurrentTime) {
          onProgress?.(Math.floor(playerRef.current.getCurrentTime()));
        }
      }, 5000);
    } else if (event.data === YT.PlayerState.PAUSED) {
      clearInterval_();
      if (playerRef.current?.getCurrentTime) {
        onProgress?.(Math.floor(playerRef.current.getCurrentTime()));
      }
    } else if (event.data === YT.PlayerState.ENDED) {
      clearInterval_();
      if (!completedRef.current) {
        completedRef.current = true;
        onCompleted?.();
      }
    }
  }, [onProgress, onCompleted]);

  useEffect(() => {
    completedRef.current = false;

    const loadPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        videoId,
        playerVars: { start: startSeconds, rel: 0, modestbranding: 1 },
        events: { onStateChange },
      });
    };

    if ((window as any).YT?.Player) {
      loadPlayer();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = loadPlayer;
    }

    return () => {
      clearInterval_();
      if (playerRef.current?.destroy) playerRef.current.destroy();
    };
  }, [videoId, startSeconds, onStateChange]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-lg bg-foreground/5">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
