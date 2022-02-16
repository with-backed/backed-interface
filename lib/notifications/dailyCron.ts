import { ALL_LOAN_PROPERTIES } from 'lib/loans/subgraph/subgraphSharedConstants';
import { nftBackedLoansClient } from 'lib/urql';
import { Loan, Loan_Filter } from 'types/generated/graphql/nftLoans';
import { gql } from 'urql';

const loansQuery = gql`
    query($where: Loan_filter) {
        loans(where: $where) {
            ${ALL_LOAN_PROPERTIES}
        }
    }
`;

async function main() {
  if (process.env.killswitch) return;

  const currentTimestamp = Math.round(new Date().getTime() / 1000);
  const futureTimestamp = currentTimestamp + 24 * 3600;

  const aboutToExpireWhere: Loan_Filter = {
    endDateTimestamp_gt: currentTimestamp,
    endDateTimestamp_lt: futureTimestamp,
  };

  const graphResponse = await nftBackedLoansClient
    .query(loansQuery, {
      where: aboutToExpireWhere,
    })
    .toPromise();

  const loans = graphResponse.data['loans'] as Loan[];
  for (let i = 0; i < loans.length; i++) {
    await fetch('/api', {
      method: 'POST',
      body: JSON.stringify({ address: loans[i].borrowTicketHolder, event: '' }),
    });
  }

  const alreadyExpiredWhere: Loan_Filter = {
    endDateTimestamp_gt: currentTimestamp - 12 * 3600,
    endDateTimestamp_lt: currentTimestamp,
  };
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(() => {
    console.log('script finished running');
  });
