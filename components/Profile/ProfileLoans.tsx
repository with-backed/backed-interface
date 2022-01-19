import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { LoanCard } from 'components/LoanCard';
import { Loan } from 'types/Loan';
import styles from './profileHeader.module.css';

type ProfileLoansProps = {
  address: string;
  loans: Loan[];
};

export function ProfileLoans({ address, loans }: ProfileLoansProps) {
  return (
    <div className={styles.threeColumnWrapper}>
      <ThreeColumn>
        {loans.map((loan) => (
          <LoanCard
            key={loan.id.toString()}
            loan={loan}
            isBorrower={loan.borrower === address}
            isLender={loan.lender === address}
          />
        ))}
      </ThreeColumn>
    </div>
  );
}
