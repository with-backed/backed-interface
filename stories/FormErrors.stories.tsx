import React from 'react';

import { FormErrors } from 'components/FormErrors';

export default {
  title: 'components/FormErrors',
  component: FormErrors,
};

const errors = [
  'PC Load Letter',
  'The front fell off',
  'Marmalade temperature reaching critical',
];

export const ErrorsEmpty = () => {
  return <FormErrors />;
};

export const ErrorsFull = () => {
  return <FormErrors errors={errors} />;
};
