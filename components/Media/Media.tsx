import React, { FunctionComponent, useEffect, useState } from 'react';
import styles from './Media.module.css';

type MediaProps = {
  media: string;
  mediaMimeType: string;
  autoPlay: boolean;
}

export const Media: FunctionComponent<MediaProps> = ({
  media,
  mediaMimeType,
  autoPlay,
}) => {
  if (mediaMimeType?.includes('text')) return <Text media={media} />;

  if (mediaMimeType?.includes('video')) return <Video media={media} autoPlay={autoPlay} />;

  if (mediaMimeType?.includes('audio')) return <Audio media={media} />;

  return <img className={styles['media-content']} src={media} />;
};

function Video({ media, autoPlay }: { media: string; autoPlay: boolean }) {
  return (
    <video
      className={styles['media-content']}
      muted
      autoPlay={autoPlay}
      controls={!autoPlay}
      loop
      playsInline
    >
      <source src={media} />
    </video>
  );
}

function Audio({ media }: { media: string }) {
  return <audio className={styles['media-content']} controls src={media} />;
}

function Text({ media }: { media: string }) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(media)
      .then((r) => r.text())
      .then((r) => setContent(r));
  }, [media]);

  return (
    <div className={`${styles['media-content']} pl1 pr1 pt1 pb1`}>
      {content}
    </div>
  );
}
