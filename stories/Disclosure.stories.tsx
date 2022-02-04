import React from 'react';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { Disclosure } from 'components/Disclosure';

export default {
  title: 'Components/Disclosure',
  component: Disclosure,
};

export const Disclosures = () => {
  return (
    <ThreeColumn>
      <Fieldset legend="📝 disclosures">
        <FormWrapper>
          <Disclosure title="Sandwich Ingredients">
            <ul>
              <li>Peanut Butter</li>
              <li>Jam</li>
              <li>Pickles</li>
            </ul>
          </Disclosure>
          <Disclosure
            title="Picnic Necessities"
            subtitle="For Yogi's eyes only">
            <ul>
              <li>Basket</li>
              <li>Blanket</li>
              <li>Umbrella</li>
            </ul>
          </Disclosure>
        </FormWrapper>
      </Fieldset>
    </ThreeColumn>
  );
};
