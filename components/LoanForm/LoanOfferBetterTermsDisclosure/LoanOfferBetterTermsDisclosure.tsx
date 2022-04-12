import { Disclosure, DisclosureContent } from 'reakit/Disclosure';
import { useDisclosureState } from 'reakit/Disclosure';

type LoanOfferBetterTermsDisclosure = React.PropsWithChildren<{
  textWrapperClassName: string;
  disclosureTextClassName: string;
  className?: string;
}>;

export function LoanOfferBetterTermsDisclosure({
  textWrapperClassName,
  disclosureTextClassName,
  children,
}: LoanOfferBetterTermsDisclosure) {
  const disclosure = useDisclosureState({ visible: false });
  return (
    <>
      <div className={textWrapperClassName}>
        🎉 You are the lender on this loan! You can still{' '}
        <Disclosure
          as="text"
          role={'disclosure'}
          className={disclosureTextClassName}
          {...disclosure}>
          update the loan terms
        </Disclosure>
        , which will reset the loan duration
      </div>
      <DisclosureContent {...disclosure}>{children}</DisclosureContent>
    </>
  );
}
