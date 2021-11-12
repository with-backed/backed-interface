import { nftBackedLoansClient } from 'lib/urql';
import React from 'react';
import { Provider, useQuery } from 'urql';

const LoansQuery = `
  query {
    loans(first: 5) {
      id
      borrowTicketHolder
    }
  }
`;

const Querier = () => {
  const [result] = useQuery({
    query: LoansQuery,
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <ol>
      {data.loans.map((loan) => (
        <li key={loan.id}>{loan.borrowTicketHolder}</li>
      ))}
    </ol>
  );
};

const Wrapper = () => {
  return (
    <Provider value={nftBackedLoansClient}>
      <Querier />
    </Provider>
  );
};

export default {
  title: 'lib/urql',
  component: Wrapper,
};

export const ItQueries = () => {
  return <Wrapper />;
};
