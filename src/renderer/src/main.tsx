import './assets/styles/index.scss'

import ReactDOM from 'react-dom/client'

import App from './root/App'
import MiniWindow from './root/MiniWindow'

if (location.hash === '#/mini') {
  document.getElementById('spinner')?.remove()
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<MiniWindow />)
} else {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}
