import { fetchSuggestions } from '@renderer/services/api'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/event'
import { Assistant, Message, Suggestion } from '@renderer/types'
import { uuid } from '@renderer/utils'
import dayjs from 'dayjs'
import { FC, useEffect, useState } from 'react'
import BeatLoader from 'react-spinners/BeatLoader'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
  messages: Message[]
  lastMessage: Message | null
}

const suggestionsMap = new Map<string, Suggestion[]>()

const Suggestions: FC<Props> = ({ assistant, messages, lastMessage }) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(
    suggestionsMap.get(messages[messages.length - 1]?.id) || []
  )
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const onClick = (s: Suggestion) => {
    const message: Message = {
      id: uuid(),
      role: 'user',
      content: s.content,
      assistantId: assistant.id,
      topicId: assistant.topics[0].id || uuid(),
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'success'
    }

    EventEmitter.emit(EVENT_NAMES.SEND_MESSAGE, message)
  }

  useEffect(() => {
    const unsubscribes = [
      EventEmitter.on(EVENT_NAMES.AI_CHAT_COMPLETION, async (msg: Message) => {
        setLoadingSuggestions(true)
        const _suggestions = await fetchSuggestions({ assistant, messages: [...messages, msg] })
        if (_suggestions.length) {
          setSuggestions(_suggestions)
          suggestionsMap.set(msg.id, _suggestions)
        }
        setLoadingSuggestions(false)
      })
    ]
    return () => unsubscribes.forEach((unsub) => unsub())
  }, [assistant, messages])

  useEffect(() => {
    setSuggestions(suggestionsMap.get(messages[messages.length - 1]?.id) || [])
  }, [messages])

  if (lastMessage) {
    return null
  }

  if (loadingSuggestions) {
    return (
      <Container>
        <BeatLoader color="var(--color-text-2)" size="10" />
      </Container>
    )
  }

  if (suggestions.length === 0) {
    return <Container style={{ paddingBottom: 10 }} />
  }

  return (
    <Container>
      <SuggestionsContainer>
        {suggestions.map((s, i) => (
          <SuggestionItem key={i} onClick={() => onClick(s)}>
            {s.content} →
          </SuggestionItem>
        ))}
      </SuggestionsContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 10px 20px 55px;
  display: flex;
  width: 100%;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
`

const SuggestionsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
`

const SuggestionItem = styled.div`
  display: flex;
  align-items: center;
  width: fit-content;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: var(--color-text);
  background: var(--color-background-mute);
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`

export default Suggestions
