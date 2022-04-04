import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AllowButton, Button, DialogDisclosureButton } from 'components/Button';
import { authorizeCurrency } from 'lib/authorizations/authorizeCurrency';

jest.mock('wagmi', () => ({
  ...jest.requireActual('wagmi'),
  useSigner: jest.fn().mockReturnValue([{ data: jest.fn() }]),
}));
jest.mock('lib/authorizations/authorizeCurrency', () => ({
  ...jest.requireActual('lib/authorizations/authorizeCurrency'),
  authorizeCurrency: jest.fn(),
}));

describe('Button Components', () => {
  describe('AllowButton', () => {
    const contractAddress = '0xaddress';
    const symbol = 'SYM';

    let callback = jest.fn();
    beforeEach(() => {
      callback = jest.fn();
    });
    it('calls the approve method when clicked', () => {
      const { getByText } = render(
        <AllowButton
          contractAddress={contractAddress}
          symbol={symbol}
          callback={callback}
        />,
      );
      const button = getByText(`Authorize ${symbol}`);
      userEvent.click(button);
      expect(authorizeCurrency).toHaveBeenCalled();
    });
    it('renders a finished state when done', () => {
      const { getByText } = render(
        <AllowButton
          contractAddress={contractAddress}
          symbol={symbol}
          callback={callback}
          done={true}
        />,
      );
      getByText('Permission granted');
    });
  });

  describe('Button', () => {
    it('calls its onClick when clicked', () => {
      const handleClick = jest.fn();
      const { getByText } = render(
        <Button onClick={handleClick}>Hello</Button>,
      );
      const button = getByText('Hello');
      expect(handleClick).not.toHaveBeenCalled();
      userEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('DialogDisclosureButton', () => {
    it('calls its onClick when clicked', () => {
      const handleClick = jest.fn();
      const { getByText } = render(
        <DialogDisclosureButton onClick={handleClick}>
          Hello
        </DialogDisclosureButton>,
      );
      const button = getByText('Hello');
      expect(handleClick).not.toHaveBeenCalled();
      userEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
