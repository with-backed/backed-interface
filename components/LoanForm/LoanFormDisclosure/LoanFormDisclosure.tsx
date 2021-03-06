import { DisclosureContent } from 'reakit/Disclosure';
import { useDisclosureState } from 'reakit/Disclosure';
import { DisclosureButton } from 'components/Button';

type LoanFormDisclosure = React.PropsWithChildren<{
  title: string;
  className?: string;
}>;

export function LoanFormDisclosure({
  title,
  children,
  className,
}: LoanFormDisclosure) {
  const disclosure = useDisclosureState({ visible: false });
  return (
    <>
      <div className={className}>
        <DisclosureButton {...disclosure} id="loanFormDisclosureButton">
          {title}
        </DisclosureButton>
      </div>
      <DisclosureContent {...disclosure}>
        {(_props) => disclosure.visible && children}
      </DisclosureContent>
    </>
  );
}
