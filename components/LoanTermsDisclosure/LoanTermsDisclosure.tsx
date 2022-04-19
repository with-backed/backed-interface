import { DisclosureButton } from 'components/Button';
import { DescriptionList } from 'components/DescriptionList';
import React from 'react';
import { useDisclosureState, DisclosureContent } from 'reakit/Disclosure';

type Denomination = { address: string; symbol: string };
type Term = string | Denomination;

type LoanTermsDisclosureProps = {
  onClick: () => void;
  terms: { [key: string]: Term };
};
export function LoanTermsDisclosure({ terms }: LoanTermsDisclosureProps) {
  const disclosure = useDisclosureState({ visible: false });
  return (
    <React.Fragment>
      <DisclosureButton {...disclosure}>Review</DisclosureButton>
      <DisclosureContent {...disclosure}>
        <DescriptionList>
          {Object.entries(terms).map(([key, value]) => {
            return (
              <React.Fragment key={key}>
                <dt>{key}</dt>
                <dd>{value}</dd>
              </React.Fragment>
            );
          })}
        </DescriptionList>
      </DisclosureContent>
    </React.Fragment>
  );
}
