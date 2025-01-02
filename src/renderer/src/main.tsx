import './assets/styles/index.scss'

import ReactDOM from 'react-dom/client'

import App from './App'
import Quick from './Quick'

if (location.hash === '#/mini') {
  document.getElementById('spinner')?.remove()
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Quick />)
} else {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />)
}
