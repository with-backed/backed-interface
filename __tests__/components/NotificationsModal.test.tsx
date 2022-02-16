import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import { NotificationsModal } from 'components/NotificationsModal';

const Modal = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <NotificationsModal dialog={dialog} />
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

  it('closes the modal when cancel button is pressed', () => {
    const { getByRole, getByText } = render(<Modal />);

    getByRole('dialog');

    const button = getByText('Cancel');
    userEvent.click(button);

    // Modal is no longer present, so we expect trying to find it to fail.
    expect(() => getByRole('dialog')).toThrow();
  });
});
