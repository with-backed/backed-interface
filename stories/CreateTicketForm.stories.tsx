import React from 'react';
import {
  CreateTicketForm,
  CreateTicketFormProps,
} from 'components/createPage/CreateTicketForm';
import { noop } from 'lodash';
import { ethers } from 'ethers';

export default {
  title: 'createPage/CreateTicketForm',
  component: CreateTicketForm,
};

const props: CreateTicketFormProps = {
  collateralAddress: '',
  setCollateralAddress: noop,
  collateralTokenID: ethers.BigNumber.from(0),
  setCollateralTokenID: noop,
  setIsValidCollateral: noop,
};

export const Form = () => <CreateTicketForm {...props} />;
