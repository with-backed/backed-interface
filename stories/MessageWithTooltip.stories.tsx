import React from 'react';

import { MessageWithTooltip } from 'components/MessageWithTooltip';

export default {
  title: 'Components/MessageWithTooltip',
  component: MessageWithTooltip,
};

export const SelectStyles = () => {
  return (
    <MessageWithTooltip
      message={<p>Hover on the icon to see the tooltip</p>}
      content={<p>This should explain things</p>}
    />
  );
}
