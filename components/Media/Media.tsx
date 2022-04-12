import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Fallback } from './Fallback';
import styles from './Media.module.css';

type MediaProps = {
  media: string;
  mediaMimeType: string;
  autoPlay: boolean;
};

export const Media: FunctionComponent<MediaProps> = ({
  media,
  mediaMimeType,
  autoPlay,
}) => {
  const [hasError, setHasError] = useState(false);
  const onError = useCallback(() => {
    setHasError(true);
  }, [setHasError]);

  if (hasError) {
    return <Fallback />;
  }

  if (mediaMimeType?.includes('text')) {
    return <Text media={media} onError={onError} />;
  }

  if (mediaMimeType?.includes('video')) {
    return <Video media={media} autoPlay={autoPlay} onError={onError} />;
  }

  if (mediaMimeType?.includes('audio')) {
    return <Audio media={media} onError={onError} />;
  }

  return <img className={styles.image} src={media} onError={onError} alt="" />;
};

function Video({
  media,
  autoPlay,
  onError,
}: {
  media: string;
  autoPlay: boolean;
  onError: () => void;
}) {
  const handleClick: React.MouseEventHandler<HTMLVideoElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    [],
  );
  return (
    <video
      className={styles['media-content']}
      muted
      autoPlay={autoPlay}
      controls={!autoPlay}
      loop
      playsInline
      onError={onError}
      onClick={handleClick}>
      <source src={media} />
    </video>
  );
}

function Audio({ media, onError }: { media: string; onError: () => void }) {
  const handleClick: React.MouseEventHandler<HTMLAudioElement> = useCallback(
    (e) => {
      e.preventDefault();
    },
    [],
  );
  return (
    <audio
      className={styles['media-content']}
      controls
      src={media}
      onError={onError}
      onClick={handleClick}
    />
  );
}

function Text({ media, onError }: { media: string; onError: () => void }) {
  const [content, setContent] = useState<string | null>(null);

  useEffect(() => {
    fetch(media)
      .then((r) => r.text())
      .then((r) => setContent(r))
      .catch(() => onError());
  }, [media, onError]);

  return <div className={`${styles['media-content']}`}>{content}</div>;
}
