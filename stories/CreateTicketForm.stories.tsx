import React from 'react';
import CreateTicketForm from 'components/createPage/CreateTicketForm';

export default {
  title: 'createPage/CreateTicketForm',
  component: CreateTicketForm,
};

const props = {
  account: null,
  collateralAddress: null,
  setCollateralAddress: null,
  collateralTokenID: null,
  setCollateralTokenID: null,
  setIsValidCollateral: null,
};

export const Form = () => <CreateTicketForm {...props} />;
