import React from 'react';
import { Tooltip, TooltipReference, useTooltipState } from "reakit/Tooltip";
import styles from './MessageWithTooltip.module.css';

function TooltipIcon() {
  return <div className={styles['tooltip-icon']}>?</div>;
}

type MessageWithTooltipProps = {
  message: React.ReactNode;
  content: React.ReactNode;
};
export function MessageWithTooltip({ message, content }: MessageWithTooltipProps) {
  const tooltip = useTooltipState();
  return (
    <div className={styles.wrapper}>
      {message}
      <TooltipReference {...tooltip}>
        <TooltipIcon />
      </TooltipReference>
      <Tooltip className={styles.tooltip} {...tooltip}>
        {content}
      </Tooltip>
    </div>
  );
}
