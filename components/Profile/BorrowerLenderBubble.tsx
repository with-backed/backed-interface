import styles from './borrowerLenderBubble.module.css';

type BubblesProps = {
  borrower: boolean;
};

export function BorrowerLenderBubble({ borrower }: BubblesProps) {
  return (
    <div
      className={`${styles.bubble} ${
        borrower ? styles.borrowerBubble : styles.lenderBubble
      }`}>{`You are the ${borrower ? 'borrower' : 'lender'}`}</div>
  );
}
