import React, { useEffect, useRef } from "react";
import Plyr from "plyr";
import "plyr/dist/plyr.css";

interface PlyrPlayerProps {
  source: string;
}

const PlyrPlayer = ({ source }: PlyrPlayerProps) => {
  const player = useRef<Plyr | null>(null);

  useEffect(() => {
    if (player.current === null) {
      player.current = new Plyr("#player", {
        controls: [
          "play",
          "progress",
          "current-time",
          "mute",
          "volume",
          "fullscreen",
        ],
      });
    }

    return () => {
      if (player.current) {
        player.current.destroy();
      }
    };
  }, []);

  return (
    <audio controls id="player">
      <source src={source} type="audio/mp3" />
    </audio>
  );
};

export default PlyrPlayer;
