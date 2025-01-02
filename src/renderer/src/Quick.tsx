import '@renderer/databases'

import store, { persistor } from '@renderer/store'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'

import AntdProvider from './context/AntdProvider'
import { SyntaxHighlighterProvider } from './context/SyntaxHighlighterProvider'
import { ThemeProvider } from './context/ThemeProvider'
import ChatWindow from './pages/windows/chat/ChatWindow'
import HomeWindow from './pages/windows/home/HomeWindow'
import { ThemeMode } from './types'

function Quick(): JSX.Element {
  const [route, setRoute] = useState<'home' | 'chat' | 'translate' | 'summary' | 'explanation'>('home')

  return (
    <Provider store={store}>
      <ThemeProvider defaultTheme={ThemeMode.auto}>
        <AntdProvider>
          <SyntaxHighlighterProvider>
            <PersistGate loading={null} persistor={persistor}>
              {route === 'home' && <HomeWindow />}
              {route === 'chat' && <ChatWindow />}
            </PersistGate>
          </SyntaxHighlighterProvider>
        </AntdProvider>
      </ThemeProvider>
    </Provider>
  )
}

export default Quick
