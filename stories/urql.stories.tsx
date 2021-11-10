import { UrqlContext } from 'context/urql';
import React, { useContext } from 'react';
import { Provider, useQuery } from 'urql';

const LoansQuery = `
  query {
    loans(first: 5) {
      id
      borrowTickerHolder
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
  console.log({ data });
  return (
    <ol>
      {data.loans.map((loan) => (
        <li key={loan.id}>{loan.borrowTickerHolder}</li>
      ))}
    </ol>
  );
};

const Wrapper = () => {
  const { nftBackedLoansClient } = useContext(UrqlContext);
  return (
    <Provider value={nftBackedLoansClient}>
      <Querier />
    </Provider>
  );
};

export default {
  title: 'context/urql',
  component: Wrapper,
};

export const ItQueries = () => {
  return <Wrapper />;
};
