import OpenAI from 'openai'

export type Assistant = {
  id: string
  name: string
  prompt: string
  topics: Topic[]
  emoji?: string
  description?: string
  model?: Model
  settings?: AssistantSettings
}

export type AssistantSettings = {
  contextCount: number
  temperature: number
  maxTokens: number | undefined
  enableMaxTokens: boolean
}

export type Message = {
  id: string
  assistantId: string
  role: 'user' | 'assistant'
  content: string
  topicId: string
  createdAt: string
  status: 'sending' | 'pending' | 'success' | 'paused' | 'error'
  modelId?: string
  files?: File[]
  images?: string[]
  usage?: OpenAI.Completions.CompletionUsage
  type?: 'text' | '@' | 'clear'
}

export type Topic = {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  messages: Message[]
}

export type User = {
  id: string
  name: string
  avatar: string
  email: string
}

export type Provider = {
  id: string
  name: string
  apiKey: string
  apiHost: string
  models: Model[]
  enabled?: boolean
  isSystem?: boolean
}

export type Model = {
  id: string
  provider: string
  name: string
  group: string
  owned_by?: string
  description?: string
}

export type Agent = {
  id: string
  name: string
  emoji: string
  description?: string
  prompt: string
  group: string
}

export type Suggestion = {
  content: string
}

export type MinAppType = {
  id?: string | number
  name: string
  logo: string
  url: string
}

export interface FileMetadata {
  id: string
  name: string
  file_name: string
  path: string
  size: number
  ext: string
  created_at: Date
}
