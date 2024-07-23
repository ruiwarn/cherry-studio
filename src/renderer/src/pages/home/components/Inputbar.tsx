import {
  ClearOutlined,
  ControlOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HistoryOutlined,
  MoreOutlined,
  PauseCircleOutlined,
  PlusCircleOutlined
} from '@ant-design/icons'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { useShowRightSidebar } from '@renderer/hooks/useStore'
import { getDefaultTopic } from '@renderer/services/assistant'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import store, { useAppSelector } from '@renderer/store'
import { setGenerating } from '@renderer/store/runtime'
import { Assistant, Message, Topic } from '@renderer/types'
import { estimateInputTokenCount, uuid } from '@renderer/utils'
import { Button, Popconfirm, Tooltip } from 'antd'
import TextArea, { TextAreaRef } from 'antd/es/input/TextArea'
import dayjs from 'dayjs'
import { debounce, isEmpty } from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import AssistantSettings from './AssistantSettings'
import SendMessageSetting from './SendMessageSetting'
import { DEFAULT_CONEXTCOUNT } from '@renderer/config/constant'

interface Props {
  assistant: Assistant
  setActiveTopic: (topic: Topic) => void
}

const Inputbar: FC<Props> = ({ assistant, setActiveTopic }) => {
  const [text, setText] = useState('')
  const { toggleRightSidebar } = useShowRightSidebar()
  const { addTopic } = useAssistant(assistant.id)
  const { sendMessageShortcut } = useSettings()
  const [expended, setExpend] = useState(false)
  const [estimateTokenCount, setEstimateTokenCount] = useState(0)
  const generating = useAppSelector((state) => state.runtime.generating)
  const inputRef = useRef<TextAreaRef>(null)
  const { t } = useTranslation()

  const sendMessage = () => {
    if (generating) {
      return
    }

    if (isEmpty(text.trim())) {
      return
    }

    const message: Message = {
      id: uuid(),
      role: 'user',
      content: text,
      assistantId: assistant.id,
      topicId: assistant.topics[0].id || uuid(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'success'
    }

    EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)

    setText('')
  }

  const inputTokenCount = useMemo(() => estimateInputTokenCount(text), [text])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (sendMessageShortcut === 'Enter' && event.key === 'Enter') {
      if (event.shiftKey) {
        return
      }
      sendMessage()
      return event.preventDefault()
    }

    if (sendMessageShortcut === 'Shift+Enter' && event.key === 'Enter' && event.shiftKey) {
      sendMessage()
      return event.preventDefault()
    }
  }

  const addNewTopic = useCallback(() => {
    const topic = getDefaultTopic()
    addTopic(topic)
    setActiveTopic(topic)
  }, [addTopic, setActiveTopic])

  const clearTopic = () => EventEmitter.emit(EVENT_NAMES.CLEAR_MESSAGES)

  const onPause = () => {
    window.keyv.set(EVENT_NAMES.CHAT_COMPLETION_PAUSED, true)
    store.dispatch(setGenerating(false))
  }

  // Command or Ctrl + N create new topic
  useEffect(() => {
    const onKeydown = (e) => {
      if (!generating) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
          addNewTopic()
          inputRef.current?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  }, [addNewTopic, generating])

  useEffect(() => {
    const _setEstimateTokenCount = debounce(setEstimateTokenCount, 100, { leading: false, trailing: true })
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.EDIT_MESSAGE, (message: Message) => {
        setText(message.content)
        inputRef.current?.focus()
      }),
      EventEmitter.on(EVENT_NAMES.ESTIMATED_TOKEN_COUNT, _setEstimateTokenCount)
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [assistant])

  return (
    <Container id="inputbar" style={{ minHeight: expended ? '35%' : 'var(--input-bar-height)' }}>
      <Toolbar>
        <ToolbarMenu>
          <Tooltip placement="top" title={t('assistant.input.new_chat')} arrow>
            <ToolbarButton type="text" onClick={addNewTopic}>
              <PlusCircleOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('assistant.input.topics')} arrow>
            <ToolbarButton type="text" onClick={toggleRightSidebar}>
              <HistoryOutlined />
            </ToolbarButton>
          </Tooltip>
          <Tooltip placement="top" title={t('assistant.input.clear')} arrow>
            <Popconfirm
              icon={false}
              title={t('assistant.input.clear.title')}
              description={t('assistant.input.clear.content')}
              placement="top"
              onConfirm={clearTopic}
              okText={t('assistant.input.clear')}>
              <ToolbarButton type="text">
                <ClearOutlined />
              </ToolbarButton>
            </Popconfirm>
          </Tooltip>
          <AssistantSettings assistant={assistant}>
            <ToolbarButton type="text">
              <ControlOutlined />
            </ToolbarButton>
          </AssistantSettings>
          <Tooltip placement="top" title={expended ? t('assistant.input.collapse') : t('assistant.input.expand')} arrow>
            <ToolbarButton type="text" onClick={() => setExpend(!expended)}>
              {expended ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            </ToolbarButton>
          </Tooltip>
        </ToolbarMenu>
        <ToolbarMenu>
          {generating && (
            <Tooltip placement="top" title={t('assistant.input.pause')} arrow>
              <ToolbarButton type="text" onClick={onPause}>
                <PauseCircleOutlined style={{ color: 'var(--color-error)' }} />
              </ToolbarButton>
            </Tooltip>
          )}
          <SendMessageSetting>
            <ToolbarButton type="text" style={{ marginRight: 0 }}>
              <MoreOutlined />
            </ToolbarButton>
          </SendMessageSetting>
        </ToolbarMenu>
      </Toolbar>
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('assistant.input.placeholder')}
        autoFocus
        contextMenu="true"
        variant="borderless"
        showCount
        ref={inputRef}
        styles={{ textarea: { paddingLeft: 0 } }}
      />
      <TextCount>
        <HistoryOutlined /> {assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT} |{' '}
        {t('assistant.input.estimated_tokens')}: {`${inputTokenCount}/${estimateTokenCount}`}
      </TextCount>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: var(--input-bar-height);
  border-top: 0.5px solid var(--color-border);
  padding: 5px 15px;
  transition: all 0.3s ease;
  position: relative;
`

const Textarea = styled(TextArea)`
  padding: 0;
  border-radius: 0;
  display: flex;
  flex: 1;
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 -5px;
  margin-bottom: 5px;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ToolbarButton = styled(Button)`
  width: 32px;
  height: 32px;
  font-size: 18px;
  border-radius: 50%;
  transition: all 0.3s ease;
  margin-right: 6px;
  color: var(--color-icon);
  &.anticon {
    transition: all 0.3s ease;
    color: var(--color-icon);
  }
  &:hover {
    background-color: var(--color-background-soft);
    .anticon {
      color: white;
    }
  }
`

const TextCount = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  font-size: 11px;
  color: var(--color-text-3);
  z-index: 10;
`

export default Inputbar
