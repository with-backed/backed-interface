import { PendingCommunityTransactions } from 'components/PendingCommunityTransactions/PendingCommunityTransactions';
import { getPendingMultiSigChanges } from 'lib/communityNFT/multisig';
import { GetServerSideProps } from 'next';
import { PendingChanges } from 'pages/api/community/multiSigTxs';

export type MultiSigProps = {
  multiSigChanges: string;
};

export const getServerSideProps: GetServerSideProps<MultiSigProps> = async (
  context,
) => {
  return {
    props: {
      multiSigChanges: JSON.stringify(await getPendingMultiSigChanges()),
    },
  };
};

export default function MultiSig({ multiSigChanges }: MultiSigProps) {
  return (
    <PendingCommunityTransactions
      multiSigChanges={JSON.parse(multiSigChanges)}
    />
  );
}
