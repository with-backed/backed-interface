import { Custom404 } from 'components/Custom404';
import { PawnShopHeader } from 'components/PawnShopHeader';

export default function Page() {
  return (
    <>
      <PawnShopHeader isErrorPage={true} />
      <Custom404 />
    </>
  );
}
