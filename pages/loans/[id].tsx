import { GetServerSideProps } from 'next';
import { Ticket } from 'components/Ticket';

type TicketsProps = {
  id: string;
}

export const getServerSideProps: GetServerSideProps<TicketsProps> = async (context) => {
  const id = context.params?.id as string;
  return {
    props: {
      id,
    }
  };
};

export default function Tickets({ id }: TicketsProps) {
  return (
    <Ticket ticketID={id} />
  );
}
