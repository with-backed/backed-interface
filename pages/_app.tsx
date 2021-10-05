import 'semantic-ui-css/semantic.min.css'
import '../styles/global.css'
import '../styles/ticketPage.css'
import '../styles/collateralCard.css'
import '../styles/underwriteCard.css'
import '../styles/createPage.css'
import { AppProps } from 'next/app'

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}