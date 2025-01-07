import { FONT_FAMILY } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useModel } from '@renderer/hooks/useModel'
import { useSettings } from '@renderer/hooks/useSettings'
import MessageContent from '@renderer/pages/home/Messages/MessageContent'
import MessageErrorBoundary from '@renderer/pages/home/Messages/MessageErrorBoundary'
import { fetchChatCompletion } from '@renderer/services/ApiService'
import { Message, Topic } from '@renderer/types'
import { Dispatch, FC, memo, SetStateAction, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

interface Props {
  message: Message
  topic?: Topic
  index?: number
  total?: number
  onGetMessages?: () => Message[]
  onSetMessages?: Dispatch<SetStateAction<Message[]>>
}

const getMessageBackground = (isBubbleStyle: boolean, isAssistantMessage: boolean) =>
  isBubbleStyle ? (isAssistantMessage ? 'transparent' : 'var(--chat-background-user)') : undefined

const MessageItem: FC<Props> = ({ message: _message, topic, onSetMessages, onGetMessages }) => {
  const [message, setMessage] = useState(_message)
  const { assistant } = useAssistant(message.assistantId)
  const model = useModel(message.modelId)
  const isBubbleStyle = true
  const { messageFont, fontSize } = useSettings()
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const isAssistantMessage = message.role === 'assistant'

  const fontFamily = useMemo(() => {
    return messageFont === 'serif' ? FONT_FAMILY.replace('sans-serif', 'serif').replace('Ubuntu, ', '') : FONT_FAMILY
  }, [messageFont])

  const messageBackground = getMessageBackground(true, isAssistantMessage)

  useEffect(() => {
    if (topic && onGetMessages && onSetMessages) {
      if (message.status === 'sending') {
        const messages = onGetMessages()
        fetchChatCompletion({
          message,
          messages: messages
            .filter((m) => !m.status.includes('ing'))
            .slice(
              0,
              messages.findIndex((m) => m.id === message.id)
            ),
          assistant,
          topic,
          onResponse: (msg) => {
            setMessage(msg)
            if (msg.status !== 'pending') {
              const _messages = messages.map((m) => (m.id === msg.id ? msg : m))
              onSetMessages(_messages)
            }
          }
        })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.status])

  return (
    <MessageContainer
      key={message.id}
      ref={messageContainerRef}
      style={isBubbleStyle ? { alignItems: isAssistantMessage ? 'start' : 'end' } : undefined}>
      <MessageContentContainer
        className="message-content-container"
        style={{ fontFamily, fontSize, background: messageBackground }}>
        <MessageErrorBoundary>
          <MessageContent message={message} model={model} />
        </MessageErrorBoundary>
      </MessageContentContainer>
    </MessageContainer>
  )
}

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  transition: background-color 0.3s ease;
  &.message-highlight {
    background-color: var(--color-primary-mute);
  }
  .menubar {
    opacity: 0;
    transition: opacity 0.2s ease;
    &.show {
      opacity: 1;
    }
  }
  &:hover {
    .menubar {
      opacity: 1;
    }
  }
`

const MessageContentContainer = styled.div`
  max-width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 46px;
  margin-top: 5px;
`

export default memo(MessageItem)
