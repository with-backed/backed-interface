import 'semantic-ui-css/semantic.min.css'
import '../styles/global.css'
import '../styles/ticketPage.css'
import '../styles/collateralCard.css'
import '../styles/underwriteCard.css'
import '../styles/createPage.css'

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
}
