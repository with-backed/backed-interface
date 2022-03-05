import {
  Disclosure as ReakitDisclosure,
  DisclosureContent,
} from 'reakit/Disclosure';
import { useDisclosureState } from 'reakit/Disclosure';
import { DisclosureButton } from 'components/Button';
import styles from './LoanFormDisclosure.module.css';

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
    <div className={styles.wrapper}>
      <div>
        <ReakitDisclosure {...disclosure}>
          {(props) => (
            <DisclosureButton
              kind={disclosure2.visible ? 'secondary' : 'primary'}
              {...props}
              {...disclosure2}>
              {title}
            </DisclosureButton>
          )}
        </ReakitDisclosure>
        <DisclosureContent {...disclosure} className={styles['mt-half-gap']}>
          {children}
        </DisclosureContent>
      </div>
      <DisclosureContent {...disclosure2}>{renderRightCol()}</DisclosureContent>
    </div>
  );
}
