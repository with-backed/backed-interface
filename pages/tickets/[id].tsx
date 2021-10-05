import Head from 'next/head'

import { useRouter } from 'next/router'
import Ticket from "../../components/Ticket"

export default function Tickets() {
  const router = useRouter()
  const { id } = router.query

  return (
  	<div>
      <Ticket ticketID={id} />
    </div>
  )
}