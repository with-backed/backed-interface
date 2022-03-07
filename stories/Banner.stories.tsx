import React, { useCallback, useState } from 'react';
import { Banner, BannerKind } from 'components/Banner';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Button } from 'components/Button';

export default {
  title: 'Components/Banner',
  component: Banner,
};

type BannerSpec = {
  kind: BannerKind;
  children: React.ReactNode;
  id: number;
};

let currentId = 0;

export const Banners = () => {
  const [banners, setBanners] = useState<BannerSpec[]>([]);

  const removeBanner = useCallback(
    (idToRemove: number) => {
      setBanners((prev) => prev.filter(({ id }) => id !== idToRemove));
    },
    [setBanners],
  );

  const addBanner = useCallback(
    (kind: BannerKind) => {
      const id = ++currentId;
      setBanners((prev) => [
        ...prev,
        { id, kind, children: <span>This is a message</span> },
      ]);
    },
    [setBanners],
  );

  return (
    <>
      {banners.map(({ kind, children, id }) => {
        return (
          <Banner key={id} kind={kind} close={() => removeBanner(id)}>
            {children}
          </Banner>
        );
      })}
      <br />
      <ThreeColumn>
        <Button onClick={() => addBanner('success')}>Add success banner</Button>
        <Button onClick={() => addBanner('info')}>Add info banner</Button>
        <Button onClick={() => addBanner('error')}>Add error banner</Button>
      </ThreeColumn>
    </>
  );
};
