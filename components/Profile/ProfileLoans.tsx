import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { LoanCard } from 'components/LoanCard';
import { Loan } from 'types/Loan';

type ProfileLoansProps = {
  address: string;
  loans: Loan[];
};

export function ProfileLoans({ address, loans }: ProfileLoansProps) {
  return (
    <TwelveColumn>
      {loans.map((loan) => (
        <LoanCard
          key={loan.id.toString()}
          loan={loan}
          selectedAddress={address}
        />
      ))}
    </TwelveColumn>
  );
}
