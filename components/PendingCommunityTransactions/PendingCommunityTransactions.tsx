import { Fieldset } from 'components/Fieldset';
import { ethers } from 'ethers';
import { PendingChanges } from 'lib/communityNFT/multisig';
import Link from 'next/link';
import styles from './PendingCommunityTransactions.module.css';

type PendingCommunityTransactionsProps = {
  multiSigChanges: { [key: number]: PendingChanges[] };
};

export function PendingCommunityTransactions({
  multiSigChanges,
}: PendingCommunityTransactionsProps) {
  return (
    <div>
      {Object.keys(multiSigChanges).map((nonce) => (
        <div className={styles.wrapper}>
          <Fieldset legend={`Pending Transaction #${nonce}`} key={nonce}>
            {multiSigChanges[parseInt(nonce)].map((change, i) => {
              return (
                <>
                  <span>Change #{i + 1}</span>
                  <ol className={styles.list}>
                    <li>account: {change.account}</li>
                    <li>id: {change.id}</li>
                    <li>
                      value: {ethers.BigNumber.from(change.value).toString()}
                    </li>
                    <li>
                      {' '}
                      IPFS Link:{' '}
                      <Link href={change.ipfsLink}>{change.ipfsLink}</Link>
                    </li>
                  </ol>
                </>
              );
            })}
          </Fieldset>
        </div>
      ))}
    </div>
  );
}
