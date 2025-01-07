import Scrollbar from '@renderer/components/Scrollbar'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { TopicManager } from '@renderer/hooks/useTopic'
import { getDefaultTopic } from '@renderer/services/AssistantService'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import { getAssistantMessage } from '@renderer/services/MessagesService'
import { Assistant, Message, Topic } from '@renderer/types'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import MessageItem from './Message'

interface Props {
  assistant: Assistant
  topic: Topic
  setActiveTopic: (topic: Topic) => void
}

interface ContainerProps {
  right?: boolean
}

const Messages: FC<Props> = ({ assistant, topic }) => {
  const [messages, setMessages] = useState<Message[]>([])

  const containerRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef(messages)
  const { updateTopic } = useAssistant(assistant.id)
  const { showTopics, topicPosition, showAssistants } = useSettings()

  messagesRef.current = messages

  const maxWidth = useMemo(() => {
    const showRightTopics = showTopics && topicPosition === 'right'
    const minusAssistantsWidth = showAssistants ? '- var(--assistants-width)' : ''
    const minusRightTopicsWidth = showRightTopics ? '- var(--assistants-width)' : ''
    return `calc(100vw - var(--sidebar-width) ${minusAssistantsWidth} ${minusRightTopicsWidth} - 5px)`
  }, [showAssistants, showTopics, topicPosition])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'auto' }), 50)
  }, [])

  const onSendMessage = useCallback(
    async (message: Message) => {
      const assistantMessage = getAssistantMessage({ assistant, topic })

      setMessages((prev) => {
        const messages = prev.concat([message, assistantMessage])
        return messages
      })

      scrollToBottom()
    },
    [assistant, scrollToBottom, topic]
  )

  const onGetMessages = useCallback(() => {
    return messagesRef.current
  }, [])

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.SEND_MESSAGE, onSendMessage),
      EventEmitter.on(EVENT_NAMES.CLEAR_MESSAGES, () => {
        setMessages([])
        const defaultTopic = getDefaultTopic(assistant.id)
        updateTopic({ ...topic, name: defaultTopic.name, messages: [] })
        TopicManager.clearTopicMessages(topic.id)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [assistant.id, onSendMessage, topic, updateTopic])

  return (
    <Container
      id="messages"
      style={{ maxWidth }}
      key={assistant.id}
      ref={containerRef}
      right={topicPosition === 'left'}>
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          topic={topic}
          index={index}
          onSetMessages={setMessages}
          onGetMessages={onGetMessages}
        />
      ))}
    </Container>
  )
}

const Container = styled(Scrollbar)<ContainerProps>`
  display: flex;
  flex-direction: column;
  padding: 0 15px;
  padding-bottom: 20px;
  overflow-x: hidden;
  min-width: 100%;
  background-color: transparent !important;
`

export default Messages
