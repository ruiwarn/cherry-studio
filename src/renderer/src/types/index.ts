import OpenAI from 'openai'
import { BuiltinTheme } from 'shiki'

export type Assistant = {
  id: string
  name: string
  prompt: string
  topics: Topic[]
  type: string
  emoji?: string
  description?: string
  model?: Model
  defaultModel?: Model
  settings?: Partial<AssistantSettings>
  messages?: AssistantMessage[]
  enableWebSearch?: boolean
}

export type AssistantMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantSettings = {
  contextCount: number
  temperature: number
  topP: number
  maxTokens: number | undefined
  enableMaxTokens: boolean
  streamOutput: boolean
  hideMessages: boolean
  autoResetModel: boolean
}

export type Agent = Omit<Assistant, 'model'>

export type Message = {
  id: string
  assistantId: string
  role: 'user' | 'assistant'
  content: string
  translatedContent?: string
  topicId: string
  createdAt: string
  status: 'sending' | 'pending' | 'success' | 'paused' | 'error'
  modelId?: string
  files?: FileType[]
  images?: string[]
  usage?: OpenAI.Completions.CompletionUsage
  metrics?: Metrics
  knowledgeBaseIds?: string[]
  type: 'text' | '@' | 'clear'
  isPreset?: boolean
}

export type Metrics = {
  completion_tokens?: number
  time_completion_millsec?: number
  time_first_token_millsec?: number
}

export type Topic = {
  id: string
  assistantId: string
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
  type: ProviderType
  name: string
  apiKey: string
  apiHost: string
  apiVersion?: string
  models: Model[]
  enabled?: boolean
  isSystem?: boolean
}

export type ProviderType = 'openai' | 'anthropic' | 'gemini'

export type ModelType = 'text' | 'vision' | 'embedding'

export type Model = {
  id: string
  provider: string
  name: string
  group: string
  owned_by?: string
  description?: string
  type?: ModelType[]
}

export type Suggestion = {
  content: string
}

export interface Painting {
  id: string
  urls: string[]
  files: FileType[]
  prompt?: string
  negativePrompt?: string
  imageSize?: string
  numImages?: number
  seed?: string
  steps?: number
  guidanceScale?: number
  model?: string
}

export type MinAppType = {
  id?: string | number
  name: string
  logo: string
  url: string
  bodered?: boolean
}

export interface FileType {
  id: string
  name: string
  origin_name: string
  path: string
  size: number
  ext: string
  type: FileTypes
  created_at: Date
  count: number
  tokens?: number
}

export enum FileTypes {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TEXT = 'text',
  DOCUMENT = 'document',
  OTHER = 'other'
}

export enum ThemeMode {
  light = 'light',
  dark = 'dark',
  auto = 'auto'
}
export type LanguageVarious = 'zh-CN' | 'zh-TW' | 'en-US' | 'ru-RU'
export type CodeStyleVarious = BuiltinTheme | 'auto'

export type WebDavConfig = {
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
}

export type AppInfo = {
  version: string
  isPackaged: boolean
  appPath: string
  appDataPath: string
  filesPath: string
  logsPath: string
}

export interface Shortcut {
  key: string
  shortcut: string[]
  editable: boolean
  enabled: boolean
  system: boolean
}

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed'

export type KnowledgeItemType = 'file' | 'url' | 'note' | 'sitemap' | 'directory'

export type KnowledgeItem = {
  id: string
  baseId?: string
  uniqueId?: string
  type: KnowledgeItemType
  content: string | FileType
  created_at: number
  updated_at: number
  processingStatus?: ProcessingStatus
  processingProgress?: number
  processingError?: string
  retryCount?: number
}

export interface KnowledgeBase {
  id: string
  name: string
  model: Model
  dimensions: number
  description?: string
  items: KnowledgeItem[]
  created_at: number
  updated_at: number
}

export type KnowledgeBaseParams = {
  id: string
  model: string
  dimensions: number
  apiKey: string
  baseURL: string
}
