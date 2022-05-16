import React from 'react';
import { screen, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import { NotificationsModal } from 'components/NotificationsModal';
import fetchMock from 'jest-fetch-mock';

const Modal = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <NotificationsModal
        profileAddress="0x70a85de679bc98acf97d2f890e2466cd69933cc4"
        dialog={dialog}
      />
    </>
  );
};

describe('NotificationsModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders', () => {
    const { getByRole, getByText } = render(<Modal />);

    getByRole('dialog');
    getByText('🔔 Subscribe to updates 📪️');
  });

  it('makes request to subscribe API and closes modal if 200 is returned', async () => {
    fetchMock.mockResponse('success');

    const { getByRole, getByText, getByPlaceholderText } = render(<Modal />);
    userEvent.type(
      getByPlaceholderText('Enter email address'),
      'anotherEmail@gmail.com',
    );

    userEvent.click(getByText('Subscribe'));

    await waitFor(() => {
      expect(() => getByRole('dialog')).toThrow();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/network/rinkeby/addresses/0x70a85de679bc98acf97d2f890e2466cd69933cc4/notifications/emails/anotherEmail@gmail.com',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('displays error if API returns non 200', async () => {
    fetchMock.mockResponse((_req) =>
      Promise.resolve({
        body: JSON.stringify({ message: 'some failure' }),
        init: {
          status: 400,
        },
      }),
    );

    const { getByText, getByPlaceholderText } = render(<Modal />);
    userEvent.type(
      getByPlaceholderText('Enter email address'),
      'anotherEmail@gmail.com',
    );

    userEvent.click(getByText('Subscribe'));

    await screen.findByText('some failure');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/network/rinkeby/addresses/0x70a85de679bc98acf97d2f890e2466cd69933cc4/notifications/emails/anotherEmail@gmail.com',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('closes the modal when cancel button is pressed', () => {
    const { getByRole, getByText } = render(<Modal />);

    getByRole('dialog');

    const button = getByText('Cancel');
    userEvent.click(button);

    // Modal is no longer present, so we expect trying to find it to fail.
    expect(() => getByRole('dialog')).toThrow();
  });
});
