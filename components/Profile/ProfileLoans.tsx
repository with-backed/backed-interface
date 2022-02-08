import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { LoanCard } from 'components/LoanCard';
import { Loan } from 'types/Loan';
import styles from './profile.module.css';

type ProfileLoansProps = {
  address: string;
  loans: Loan[];
};

export function ProfileLoans({ address, loans }: ProfileLoansProps) {
  return (
    <div className={styles['three-column-wrapper']}>
      {loans.map((loan) => (
        <LoanCard
          key={loan.id.toString()}
          loan={loan}
          selectedAddress={address}
        />
      ))}
    </div>
  );
}
