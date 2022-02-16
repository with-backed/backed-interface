import React from 'react';
import { render, screen } from '@testing-library/react';
import { DisplayAddress } from 'components/DisplayAddress';
import { addressToENS } from 'lib/account';

const address = '0x0DD7D78Ed27632839cd2a929EE570eAd346C19fC';
const ens = 'moonparty.eth';

jest.mock('lib/account', () => ({
  ...jest.requireActual('lib/account'),
  addressToENS: jest.fn(),
}));

const mockAddressToENS = addressToENS as jest.MockedFunction<
  typeof addressToENS
>;

describe('DisplayAddress', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddressToENS.mockResolvedValue(ens);
  });
  it('renders a regular address', () => {
    const { getByText } = render(
      <DisplayAddress address={address} useEns={false} />,
    );

    getByText(address);
    expect(mockAddressToENS).not.toHaveBeenCalled();
  });

  it('renders the address if there is no corresponding ENS name', async () => {
    mockAddressToENS.mockResolvedValue(null);
    render(<DisplayAddress address={address} />);

    await screen.findByText(address);
  });

  it('renders the ENS name if an address resolves to one', async () => {
    render(<DisplayAddress address={address} />);

    await screen.findByText(ens);
  });

  it('renders the address if an error occurs querying ENS', async () => {
    mockAddressToENS.mockImplementation(() => {
      throw new Error('fail');
    });
    render(<DisplayAddress address={address} />);

    await screen.findByText(address);
  });
});
