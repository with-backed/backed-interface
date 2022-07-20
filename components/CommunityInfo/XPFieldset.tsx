import { Fieldset } from 'components/Fieldset';
import { ShimmerPlus } from 'components/Icons/ShimmerPlus';
import React, { FunctionComponent } from 'react';
import styles from './CommunityInfo.module.css';

type XPKind = 'activity' | 'community' | 'contributor';

const titleMap = {
  activity: 'Activity XP',
  community: 'Community XP',
  contributor: 'Contributor XP',
};

type LegendProps = {
  kind: XPKind;
};
function Legend({ kind }: LegendProps) {
  return (
    <h3 className={styles.legend}>
      <ShimmerPlus kind={kind} /> {titleMap[kind]}
    </h3>
  );
}

type XPFieldsetProps = {
  kind: XPKind;
};
export const XPFieldset: FunctionComponent<XPFieldsetProps> = ({
  kind,
  children,
}) => {
  return (
    <Fieldset legend={<Legend kind={kind} />}>
      <div className={styles['fieldset-children']}>{children}</div>
    </Fieldset>
  );
};
