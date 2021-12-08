export const environmentVariables = {
  NEXT_PUBLIC_ENV: (() => {
    const key = 'NEXT_PUBLIC_ENV';
    const value = process.env.NEXT_PUBLIC_ENV;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_CHAIN_ID: (() => {
    const key = 'NEXT_PUBLIC_CHAIN_ID';
    const value = process.env.NEXT_PUBLIC_CHAIN_ID;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_JSON_RPC_PROVIDER: (() => {
    const key = 'NEXT_PUBLIC_JSON_RPC_PROVIDER';
    const value = process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT: (() => {
    const key = 'NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT';
    const value = process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_LEND_TICKET_CONTRACT: (() => {
    const key = 'NEXT_PUBLIC_LEND_TICKET_CONTRACT';
    const value = process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_BORROW_TICKET_CONTRACT: (() => {
    const key = 'NEXT_PUBLIC_BORROW_TICKET_CONTRACT';
    const value = process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_MOCK_DAI_CONTRACT: (() => {
    const key = 'NEXT_PUBLIC_MOCK_DAI_CONTRACT';
    const value = process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_MOCK_PUNK_CONTRACT: (() => {
    const key = 'NEXT_PUBLIC_MOCK_PUNK_CONTRACT';
    const value = process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_ETHERSCAN_URL: (() => {
    const key = 'NEXT_PUBLIC_ETHERSCAN_URL';
    const value = process.env.NEXT_PUBLIC_ETHERSCAN_URL;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_OPENSEA_URL: (() => {
    const key = 'NEXT_PUBLIC_OPENSEA_URL';
    const value = process.env.NEXT_PUBLIC_OPENSEA_URL;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_OPENSEA_API_URL: (() => {
    const key = 'NEXT_PUBLIC_OPENSEA_API_URL';
    const value = process.env.NEXT_PUBLIC_OPENSEA_API_URL;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_FACILITATOR_START_BLOCK: (() => {
    const key = 'NEXT_PUBLIC_FACILITATOR_START_BLOCK';
    const value = process.env.NEXT_PUBLIC_FACILITATOR_START_BLOCK;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH: (() => {
    const key = 'NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH';
    const value = process.env.NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH;
    return validate(key, value);
  })(),
  NEXT_PUBLIC_EIP721_SUBGRAPH: (() => {
    const key = 'NEXT_PUBLIC_EIP721_SUBGRAPH';
    const value = process.env.NEXT_PUBLIC_EIP721_SUBGRAPH;
    return validate(key, value);
  })(),
};

function assert(condition: any, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg);
  }
}

function assertIsString(
  key: string,
  value: string | undefined,
): asserts value is string {
  assert(
    typeof value === 'string',
    `required environment variable ${key} undefined`,
  );
}

interface HasLength {
  length: number;
}
function assertLengthGreaterThanZero(key: string, value: HasLength) {
  assert(value.length > 0, `required environment variable ${key} `);
}

function validate(key: string, value: string | undefined): string {
  assertIsString(key, value);
  assertLengthGreaterThanZero(key, value);
  return value;
}
