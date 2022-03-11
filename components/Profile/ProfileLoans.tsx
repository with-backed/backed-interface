import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { ProfileLoanCard } from 'components/LoanCard';
import { Loan } from 'types/Loan';

type ProfileLoansProps = {
  address: string;
  loans: Loan[];
};

export function ProfileLoans({ address, loans }: ProfileLoansProps) {
  return (
    <TwelveColumn padded>
      {loans.map((loan) => (
        <ProfileLoanCard
          key={loan.id.toString()}
          loan={loan}
          selectedAddress={address}
        />
      ))}
    </TwelveColumn>
  );
}
