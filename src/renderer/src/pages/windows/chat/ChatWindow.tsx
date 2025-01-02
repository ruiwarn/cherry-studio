import Scrollbar from '@renderer/components/Scrollbar'
import { useAssistant, useAssistants } from '@renderer/hooks/useAssistant'
import { useActiveTopic } from '@renderer/hooks/useTopic'
import { FC } from 'react'
import styled from 'styled-components'

import Inputbar from './Inputbar'
import Messages from './Messages'

const ChatWindow: FC = () => {
  const { assistants } = useAssistants()
  const { assistant } = useAssistant(assistants[0].id)
  const { activeTopic, setActiveTopic } = useActiveTopic(assistant)

  return (
    <Container>
      <Navbar />
      <Main className="bubble">
        <Messages key={activeTopic.id} assistant={assistant} topic={activeTopic} setActiveTopic={setActiveTopic} />
      </Main>
      <Inputbar assistant={assistant} setActiveTopic={setActiveTopic} />
    </Container>
  )
}

const Container = styled.div`
  -webkit-app-region: drag;
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

const Main = styled(Scrollbar)`
  display: flex;
  flex: 1;
  -webkit-app-region: none;
  background-color: transparent !important;
`

const Navbar = styled.div`
  -webkit-app-region: drag;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 40px;
`

export default ChatWindow
