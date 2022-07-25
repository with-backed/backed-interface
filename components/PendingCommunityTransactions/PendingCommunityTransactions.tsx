import { Fieldset } from 'components/Fieldset';
import { ethers } from 'ethers';
import { PendingChanges } from 'lib/communityNFT/multisig';
import { convertIPFS } from 'lib/getNFTInfo';
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
        <div className={styles.wrapper} key={nonce}>
          <Fieldset legend={`Pending Transaction #${nonce}`} key={nonce}>
            {multiSigChanges[parseInt(nonce)].map((change, i) => {
              return (
                <div key={i}>
                  <span>Change #{i + 1}</span>
                  <ol className={styles.list}>
                    <li>account: {change.account}</li>
                    <li>id: {change.id}</li>
                    <li>
                      value: {ethers.BigNumber.from(change.value).toString()}
                    </li>
                    <li className={styles.ipfsLink}>
                      IPFS Link:{' '}
                      <Link
                        href={convertIPFS(change.ipfsLink) || change.ipfsLink}>
                        {convertIPFS(change.ipfsLink) || change.ipfsLink}
                      </Link>
                    </li>
                  </ol>
                </div>
              );
            })}
            <Link href="https://gnosis-safe.io/app/oeth:0xa327C62acaE63Fa70945FDFcd252b89435400AE3/transactions/queue">
              See on Gnosis
            </Link>
          </Fieldset>
        </div>
      ))}
    </div>
  );
}
