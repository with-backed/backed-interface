import { Custom500 } from 'components/Custom500';
import { Error500Header } from 'components/PawnShopHeader';

export default function Page() {
  return (
    <>
      <Error500Header />
      <Custom500></Custom500>;
    </>
  );
}
