import { SearchOutlined } from '@ant-design/icons'
import { Navbar, NavbarLeft, NavbarRight } from '@renderer/components/app/Navbar'
import AssistantSettingsPopup from '@renderer/components/AssistantSettings'
import { HStack } from '@renderer/components/Layout'
import SearchPopup from '@renderer/components/Popups/SearchPopup'
import { isMac, isWindows } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { useShortcut } from '@renderer/hooks/useShortcuts'
import { useShowAssistants, useShowTopics } from '@renderer/hooks/useStore'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import { Assistant, Topic } from '@renderer/types'
import { FC } from 'react'
import styled from 'styled-components'

import SelectModelButton from './components/SelectModelButton'

interface Props {
  activeAssistant: Assistant
  activeTopic: Topic
  setActiveTopic: (topic: Topic) => void
}

const HeaderNavbar: FC<Props> = ({ activeAssistant }) => {
  const { assistant } = useAssistant(activeAssistant.id)
  const { showAssistants, toggleShowAssistants } = useShowAssistants()
  const { topicPosition } = useSettings()
  const { showTopics, toggleShowTopics } = useShowTopics()

  useShortcut('toggle_show_assistants', () => {
    toggleShowAssistants()
  })

  useShortcut('toggle_show_topics', () => {
    if (topicPosition === 'right') {
      toggleShowTopics()
    } else {
      EventEmitter.emit(EVENT_NAMES.SHOW_TOPIC_SIDEBAR)
    }
  })

  return (
    <Navbar>
      {showAssistants && (
        <NavbarLeft style={{ justifyContent: 'space-between', borderRight: 'none', padding: '0 8px' }}>
          <NewButton onClick={toggleShowAssistants} style={{ marginLeft: isMac ? 8 : 0 }}>
            <i className="iconfont icon-hide-sidebar" />
          </NewButton>
          <NewButton onClick={() => SearchPopup.show()}>
            <SearchOutlined />
          </NewButton>
        </NavbarLeft>
      )}
      <NavbarRight style={{ justifyContent: 'space-between', paddingRight: isWindows ? 140 : 12, flex: 1 }}>
        <HStack alignItems="center">
          {!showAssistants && (
            <NewButton
              onClick={() => toggleShowAssistants()}
              style={{ marginRight: isMac ? 8 : 25, marginLeft: isMac ? 4 : 0 }}>
              <i className="iconfont icon-show-sidebar" />
            </NewButton>
          )}
          <TitleText
            style={{ marginRight: 10, cursor: 'pointer' }}
            className="nodrag"
            onClick={() => AssistantSettingsPopup.show({ assistant })}>
            {assistant.name}
          </TitleText>
          <SelectModelButton assistant={assistant} />
        </HStack>
        <HStack alignItems="center">
          {topicPosition === 'right' && (
            <NewButton onClick={toggleShowTopics}>
              <i className={`iconfont icon-${showTopics ? 'show' : 'hide'}-sidebar`} />
            </NewButton>
          )}
        </HStack>
      </NavbarRight>
    </Navbar>
  )
}

export const NewButton = styled.div`
  -webkit-app-region: none;
  border-radius: 8px;
  height: 30px;
  padding: 0 7px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  .iconfont {
    font-size: 18px;
    color: var(--color-icon);
    &.icon-a-addchat {
      font-size: 20px;
    }
    &.icon-a-darkmode {
      font-size: 20px;
    }
  }
  .anticon {
    color: var(--color-icon);
    font-size: 16px;
  }
  &:hover {
    background-color: var(--color-background-mute);
    color: var(--color-icon-white);
  }
`

const TitleText = styled.span`
  margin-left: 5px;
  font-family: Ubuntu;
  font-size: 13px;
`

export default HeaderNavbar
