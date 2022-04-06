import { Custom500 } from 'components/Custom500';
import { PawnShopHeader } from 'components/PawnShopHeader';

export default function Page() {
  return (
    <>
      <PawnShopHeader isErrorPage={true} />
      <Custom500 />
    </>
  );
}
