import { Disclosure as ReakitDisclosure, DisclosureContent } from 'reakit';
import { useDisclosureState } from 'reakit/Disclosure';
import buttonStyles from '../../Button/Button.module.css';
import styles from './LoanFormDisclosure.module.css';

type LoanFormDisclosure = React.PropsWithChildren<{
  title: string;
  rightColContent: any;
}>;

export function LoanFormDisclosure({
  title,
  children,
  rightColContent,
}: LoanFormDisclosure) {
  const disclosure = useDisclosureState({ visible: false });
  const disclosure2 = useDisclosureState({ visible: false });
  return (
    <div className={styles.wrapper}>
      <div className={styles['left-col-wrapper']}>
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
      <DisclosureContent {...disclosure2}>{rightColContent}</DisclosureContent>
    </div>
  );
}
