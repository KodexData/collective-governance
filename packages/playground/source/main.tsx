import '@kodex-data/prototypes'
import '@kodex-react/window-ethereum'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import 'assets/fonts/economica.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <HashRouter window={window}>
    <App />
  </HashRouter>
)
