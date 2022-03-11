import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { LoanCard } from 'components/LoanCard';
import { Loan } from 'types/Loan';

type ProfileLoansProps = {
  address: string;
  loans: Loan[];
};

export function ProfileLoans({ loans }: ProfileLoansProps) {
  return (
    <TwelveColumn padded>
      {loans.map((loan) => (
        <LoanCard key={loan.id.toString()} loan={loan} />
      ))}
    </TwelveColumn>
  );
}
