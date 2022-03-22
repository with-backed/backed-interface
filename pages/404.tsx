import { Custom404 } from 'components/Custom404';
import { Error404Header } from 'components/PawnShopHeader';

export default function Page() {
  return (
    <>
      <Error404Header />
      <Custom404 />
    </>
  );
}
