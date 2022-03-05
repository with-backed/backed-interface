import {
  Disclosure as ReakitDisclosure,
  DisclosureContent,
} from 'reakit/Disclosure';
import { useDisclosureState } from 'reakit/Disclosure';
import buttonStyles from '../Button/Button.module.css';
import formStyles from '../Form/Form.module.css';
import loanFormStyles from './LoanForm.module.css';

type LoanFormDisclosure = React.PropsWithChildren<{
  title: string;
  renderRightCol: () => React.ReactElement;
}>;

export function LoanFormDisclosure({
  title,
  children,
  renderRightCol,
}: LoanFormDisclosure) {
  const disclosure = useDisclosureState({ visible: false });
  const disclosure2 = useDisclosureState({ visible: false });
  return (
    <div className={loanFormStyles.wrapper}>
      <div className={formStyles.form}>
        <ReakitDisclosure {...disclosure}>
          {(props) => (
            <ReakitDisclosure
              {...props}
              {...disclosure2}
              as={'button'}
              className={
                disclosure2.visible
                  ? buttonStyles['secondary']
                  : buttonStyles['primary']
              }>
              {title}
            </ReakitDisclosure>
          )}
        </ReakitDisclosure>
        <DisclosureContent {...disclosure}>{children}</DisclosureContent>
      </div>
      <DisclosureContent {...disclosure2}>{renderRightCol()}</DisclosureContent>
    </div>
  );
}
