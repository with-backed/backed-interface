import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { pawnShopContract } from '../../lib/contracts';
import { formattedAnnualRate } from '../../lib/interest';
import { secondsToDays } from '../../lib/duration';

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export default function TicketHistory({ ticketId, loanAssetDecimals }) {
  const [history, setHistory] = useState(null);

  const setup = async () => {
    const history = await getTicketHistory(ticketId);
    console.log('0000');
    console.log(history);
    setHistory(history);
  };

  useEffect(() => {
    setup();
  }, []);

  return (
    <fieldset className="standard-fieldset">
      <legend> activity </legend>
      {history == null ? '' : history.map((e: ethers.Event, i) => <ParsedEvent event={e} loanAssetDecimals={loanAssetDecimals} key={i} />)}
    </fieldset>
  );
}

interface ParsedEventProps {
  event: ethers.Event,
  loanAssetDecimals: ethers.BigNumber,
}

function ParsedEvent({ event, loanAssetDecimals }) {
  const [timestamp, setTimestamp] = useState(0);

  const getTimeStamp = async () => {
    const t = await event.getBlock();
    setTimestamp(t.timestamp);
  };

  useEffect(() => {
    getTimeStamp();
  });
  const eventDetails = () => {
    switch (event.event) {
      case 'MintTicket':
        return MintEventDetails(event, loanAssetDecimals);
        break;
      case 'UnderwriteLoan':
        return UnderwriteEventDetails(event, loanAssetDecimals);
        break;
      case 'Repay':
        return RepayEventDetails(event, loanAssetDecimals);
        break;
    }
  };

  return (
    <div className="event-details">
      <p>
        {' '}
        <b>
          {' '}
          { camelToSentenceCase(event.event) }
          {' '}
        </b>
        {' '}
        -
        {' '}
        {toLocaleDateTime(timestamp)}
        {' '}
      </p>
      {eventDetails()}
    </div>
  );
}

function MintEventDetails(event: ethers.Event, loanAssetDecimals: ethers.BigNumber) {
  const [minter] = useState(event.args.minter);
  const [maxInterestRate] = useState(formattedAnnualRate(event.args.maxInterestRate));
  const [minLoanAmount] = useState(ethers.utils.formatUnits(event.args.minLoanAmount, loanAssetDecimals));
  const [minDuration] = useState(secondsToDays(event.args.minDurationSeconds));

  return (
    <div className="event-details">

      <p>
        {' '}
        minter:
        <a target="_blank" href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${minter}`} rel="noreferrer">
          {' '}
          {minter.slice(0, 10)}
          ...
          {' '}
        </a>
      </p>
      <p>
        {' '}
        max interest rate:
        {maxInterestRate}
        %
      </p>
      <p>
        {' '}
        minimum loan amount:
        {minLoanAmount}
      </p>
      <p>
        {' '}
        minimum duration:
        {minDuration}
      </p>
    </div>
  );
}

function toLocaleDateTime(seconds) {
  const date = new Date(0);
  date.setUTCSeconds(seconds);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

function camelToSentenceCase(text) {
  const result = text.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
}

function UnderwriteEventDetails(event: ethers.Event, loanAssetDecimals: ethers.BigNumber) {
  const [underwriter] = useState(event.args.underwriter);
  const [interestRate] = useState(formattedAnnualRate(event.args.interestRate));
  const [loanAmount] = useState(ethers.utils.formatUnits(event.args.loanAmount, loanAssetDecimals));
  const [duration] = useState(secondsToDays(event.args.durationSeconds));

  return (
    <div className="event-details">
      <p>
        {' '}
        underwriter:
        <a target="_blank" href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${underwriter}`} rel="noreferrer">
          {' '}
          {underwriter.slice(0, 10)}
          ...
          {' '}
        </a>
      </p>
      <p>
        {' '}
        interest rate:
        {interestRate}
        %
      </p>
      <p>
        {' '}
        loan amount:
        {loanAmount}
      </p>
      <p>
        {' '}
        duration:
        {duration}
      </p>
    </div>
  );
}

function RepayEventDetails(event: ethers.Event, loanAssetDecimals: ethers.BigNumber) {
  const [repayer] = useState(event.args.repayer);
  const [interestEarned] = useState(ethers.utils.formatUnits(event.args.interestEarned, loanAssetDecimals));
  const [loanAmount] = useState(ethers.utils.formatUnits(event.args.loanAmount, loanAssetDecimals));
  const [loanOwner] = useState(event.args.loanOwner);

  return (
    <div className="event-details">
      <p>
        {' '}
        repayer:
        <a target="_blank" href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${repayer}`} rel="noreferrer">
          {' '}
          {repayer.slice(0, 10)}
          ...
          {' '}
        </a>
      </p>
      <p>
        {' '}
        paid to:
        <a target="_blank" href={`${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/address/${loanOwner}`} rel="noreferrer">
          {' '}
          {loanOwner.slice(0, 10)}
          ...
          {' '}
        </a>
      </p>
      <p>
        {' '}
        interest earned:
        {interestEarned}
      </p>
      <p>
        {' '}
        loan amount:
        {loanAmount}
      </p>
    </div>
  );
}

interface EventTextProps {
  event: ethers.Event
}

function EventText({ event } : EventTextProps) {
  const [argValues, setArgValues] = useState([]);

  useEffect(() => {
    let argValues = Object.keys(event.args).map((k : string) => {
      if (`${parseInt(k)}` == k || k == 'id') {
        return null;
      }
      let value = event.args[k];
      if (value instanceof ethers.BigNumber) {
        value = value.toString();
      }
      value = `${value}`;
      if (value.length > 10) {
        value = `${value.slice(0, 10)}...`;
      }

      return { arg: k, value };
    });
    argValues = argValues.filter((a) => a != null);

    console.log(argValues);
    setArgValues(argValues);
  }, []);

  return (
    <div className="display-table">
      <p>
        <b>{event.event}</b>
        {' '}
        - block #
        {event.blockNumber}
      </p>
      {argValues.map((k, i) => <ArgValueProps arg={k.arg} value={k.value} key={i} />) }
      <br />
    </div>
  );
}

interface ArgValueProps {
  arg: string,
  value: any
}

function ArgValueProps({ arg, value }: ArgValueProps) {
  return (
    <div className="display-table">
      <p className="float-left">
        {arg}
        :
        {' '}
        {value}
      </p>
    </div>
  );
}

const getTicketHistory = async (ticketId) => {
  const contract = pawnShopContract(jsonRpcProvider);

  const mintTicketFilter = contract.filters.MintTicket(ethers.BigNumber.from(ticketId), null);
  const closeFilter = contract.filters.Close(ethers.BigNumber.from(ticketId));
  const underwriteFilter = contract.filters.UnderwriteLoan(ethers.BigNumber.from(ticketId), null);
  const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(ethers.BigNumber.from(ticketId), null, null);
  const repayAndCloseFilter = contract.filters.Repay(ethers.BigNumber.from(ticketId), null, null);
  const seizeCollateralFilter = contract.filters.SeizeCollateral(ethers.BigNumber.from(ticketId));

  const filters = [mintTicketFilter, closeFilter, underwriteFilter, buyoutUnderwriteFilter, repayAndCloseFilter, seizeCollateralFilter];

  let allEvents = [];
  for (let i = 0; i < filters.length; i++) {
    const results = await contract.queryFilter(filters[i]);
    allEvents = allEvents.concat(results);
  }
  allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

  return allEvents;
};
