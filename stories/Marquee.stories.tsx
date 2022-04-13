import React from 'react';

import { Marquee } from 'components/Marquee';

export default {
  title: 'Components/Marquee',
  component: Marquee,
};

export const MarqueeStyles = () => {
  return (
    <Marquee>
      <div>
        👀 MONARCHS earn 12% <a>See MONARCHS</a>
      </div>
      <div>
        🎉 125252.12 USD in <a>22 Active Loans</a>
      </div>
      <div>
        💸 Interest rates from <a>4%</a> to <a>18%</a>
      </div>
      <div>
        💰 Loan amounts from <a>200 DAI</a> to <a>12500 DAI</a>
      </div>
      <div>
        📈 New to NFT-backed loans? See <a>How it works</a>
      </div>
    </Marquee>
  );
};
