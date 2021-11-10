import React from 'react';
import {
  CreateTicketForm,
  CreateTicketFormProps,
} from 'components/createPage/CreateTicketForm';

export default {
  title: 'createPage/CreateTicketForm',
  component: CreateTicketForm,
};

const props: CreateTicketFormProps = {
  account: undefined,
  collateralAddress: '',
  setCollateralAddress: undefined,
  collateralTokenID: undefined,
  setCollateralTokenID: undefined,
  setIsValidCollateral: undefined,
};

export const Form = () => <CreateTicketForm {...props} />;
