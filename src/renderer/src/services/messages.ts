import { DEFAULT_CONEXTCOUNT } from '@renderer/config/constant'
import { Assistant, Message } from '@renderer/types'
import { GPTTokens } from 'gpt-tokens'
import { isEmpty, last, takeRight } from 'lodash'
import { CompletionUsage } from 'openai/resources'

import { getAssistantSettings } from './assistant'
import FileManager from './file'

export const filterMessages = (messages: Message[]) => {
  return messages
    .filter((message) => !['@', 'clear'].includes(message.type!))
    .filter((message) => !isEmpty(message.content.trim()))
}

export function filterContextMessages(messages: Message[]): Message[] {
  const clearIndex = messages.findLastIndex((message) => message.type === 'clear')

  if (clearIndex === -1) {
    return messages
  }

  return messages.slice(clearIndex + 1)
}

export function getContextCount(assistant: Assistant, messages: Message[]) {
  const contextCount = assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT
  const _messages = takeRight(messages, contextCount)
  const clearIndex = _messages.findLastIndex((message) => message.type === 'clear')
  const messagesCount = _messages.length

  if (clearIndex === -1) {
    return contextCount
  }

  return messagesCount - (clearIndex + 1)
}

export function estimateInputTokenCount(text: string) {
  const input = new GPTTokens({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: text }]
  })

  return input.usedTokens - 7
}

export async function estimateMessagesToken({
  assistant,
  messages
}: {
  assistant: Assistant
  messages: Message[]
}): Promise<CompletionUsage> {
  const responseMessageContent = last(messages)?.content
  const inputMessageContent = messages[messages.length - 2]?.content
  const completion_tokens = await estimateInputTokenCount(responseMessageContent ?? '')
  const prompt_tokens = await estimateInputTokenCount(assistant.prompt + inputMessageContent ?? '')
  return {
    completion_tokens,
    prompt_tokens: prompt_tokens,
    total_tokens: prompt_tokens + completion_tokens
  } as CompletionUsage
}

export function estimateHistoryTokenCount(assistant: Assistant, msgs: Message[]) {
  const { contextCount } = getAssistantSettings(assistant)

  const all = new GPTTokens({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: assistant.prompt },
      ...filterMessages(filterContextMessages(takeRight(msgs, contextCount))).map((message) => ({
        role: message.role,
        content: message.content
      }))
    ]
  })

  return all.usedTokens - 7
}

export function deleteMessageFiles(message: Message) {
  message.files && FileManager.deleteFiles(message.files.map((f) => f.id))
}
