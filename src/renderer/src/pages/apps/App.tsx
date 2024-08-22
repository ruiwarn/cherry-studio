import MinApp from '@renderer/components/MinApp'
import { useTheme } from '@renderer/providers/ThemeProvider'
import { MinAppType } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

interface Props {
  app: MinAppType
}

const App: FC<Props> = ({ app }) => {
  const { theme } = useTheme()

  const onClick = () => {
    const websiteReg = /claude|chatgpt|groq/i

    if (websiteReg.test(app.url)) {
      window.api.minApp({ url: app.url, windowOptions: { title: app.name } })
      return
    }

    MinApp.start(app)
  }

  return (
    <Container onClick={onClick}>
      <AppIcon src={app.logo} style={{ border: theme === 'dark' ? 'none' : '1px solid var(--color-border' }} />
      <AppTitle>{app.name}</AppTitle>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`

const AppIcon = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 16px;
  user-select: none;
  -webkit-user-drag: none;
`

const AppTitle = styled.div`
  font-size: 12px;
  margin-top: 5px;
  color: var(--color-text-soft);
  text-align: center;
`

export default App
