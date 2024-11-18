import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CodeStyleVarious, LanguageVarious, ThemeMode } from '@renderer/types'

export type SendMessageShortcut = 'Enter' | 'Shift+Enter'

export interface SettingsState {
  showAssistants: boolean
  showTopics: boolean
  sendMessageShortcut: SendMessageShortcut
  language: LanguageVarious
  proxyMode: 'system' | 'custom' | 'none'
  proxyUrl?: string
  userName: string
  showMessageDivider: boolean
  messageFont: 'system' | 'serif'
  showInputEstimatedTokens: boolean
  tray: boolean
  theme: ThemeMode
  windowStyle: 'transparent' | 'opaque'
  fontSize: number
  topicPosition: 'left' | 'right'
  showTopicTime: boolean
  pasteLongTextAsFile: boolean
  clickAssistantToShowTopic: boolean
  manualUpdateCheck: boolean
  renderInputMessageAsMarkdown: boolean
  codeShowLineNumbers: boolean
  mathEngine: 'MathJax' | 'KaTeX'
  messageStyle: 'plain' | 'bubble'
  codeStyle: CodeStyleVarious
  // webdav 配置 host, user, pass, path
  webdavHost: string
  webdavUser: string
  webdavPass: string
  webdavPath: string
}

const initialState: SettingsState = {
  showAssistants: true,
  showTopics: true,
  sendMessageShortcut: 'Enter',
  language: navigator.language as LanguageVarious,
  proxyMode: 'none',
  proxyUrl: undefined,
  userName: '',
  showMessageDivider: false,
  messageFont: 'system',
  showInputEstimatedTokens: false,
  tray: true,
  theme: ThemeMode.auto,
  windowStyle: 'transparent',
  fontSize: 14,
  topicPosition: 'left',
  showTopicTime: false,
  pasteLongTextAsFile: false,
  clickAssistantToShowTopic: false,
  manualUpdateCheck: false,
  renderInputMessageAsMarkdown: true,
  codeShowLineNumbers: false,
  mathEngine: 'MathJax',
  messageStyle: 'plain',
  codeStyle: 'auto',
  webdavHost: '',
  webdavUser: '',
  webdavPass: '',
  webdavPath: '/cherry-studio'
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setShowAssistants: (state, action: PayloadAction<boolean>) => {
      state.showAssistants = action.payload
    },
    toggleShowAssistants: (state) => {
      state.showAssistants = !state.showAssistants
    },
    setShowTopics: (state, action: PayloadAction<boolean>) => {
      state.showTopics = action.payload
    },
    toggleShowTopics: (state) => {
      state.showTopics = !state.showTopics
    },
    setSendMessageShortcut: (state, action: PayloadAction<SendMessageShortcut>) => {
      state.sendMessageShortcut = action.payload
    },
    setLanguage: (state, action: PayloadAction<LanguageVarious>) => {
      state.language = action.payload
    },
    setProxyMode: (state, action: PayloadAction<'system' | 'custom' | 'none'>) => {
      state.proxyMode = action.payload
    },
    setProxyUrl: (state, action: PayloadAction<string | undefined>) => {
      state.proxyUrl = action.payload
    },
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload
    },
    setShowMessageDivider: (state, action: PayloadAction<boolean>) => {
      state.showMessageDivider = action.payload
    },
    setMessageFont: (state, action: PayloadAction<'system' | 'serif'>) => {
      state.messageFont = action.payload
    },
    setShowInputEstimatedTokens: (state, action: PayloadAction<boolean>) => {
      state.showInputEstimatedTokens = action.payload
    },
    setTray: (state, action: PayloadAction<boolean>) => {
      state.tray = action.payload
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = action.payload
    },
    setWindowStyle: (state, action: PayloadAction<'transparent' | 'opaque'>) => {
      state.windowStyle = action.payload
      console.log(state.windowStyle)
    },
    setTopicPosition: (state, action: PayloadAction<'left' | 'right'>) => {
      state.topicPosition = action.payload
    },
    setShowTopicTime: (state, action: PayloadAction<boolean>) => {
      state.showTopicTime = action.payload
    },
    setPasteLongTextAsFile: (state, action: PayloadAction<boolean>) => {
      state.pasteLongTextAsFile = action.payload
    },
    setClickAssistantToShowTopic: (state, action: PayloadAction<boolean>) => {
      state.clickAssistantToShowTopic = action.payload
    },
    setManualUpdateCheck: (state, action: PayloadAction<boolean>) => {
      state.manualUpdateCheck = action.payload
    },
    setWebdavHost: (state, action: PayloadAction<string>) => {
      state.webdavHost = action.payload
    },
    setWebdavUser: (state, action: PayloadAction<string>) => {
      state.webdavUser = action.payload
    },
    setWebdavPass: (state, action: PayloadAction<string>) => {
      state.webdavPass = action.payload
    },
    setWebdavPath: (state, action: PayloadAction<string>) => {
      state.webdavPath = action.payload
    },
    setRenderInputMessageAsMarkdown: (state, action: PayloadAction<boolean>) => {
      state.renderInputMessageAsMarkdown = action.payload
    },
    setCodeShowLineNumbers: (state, action: PayloadAction<boolean>) => {
      state.codeShowLineNumbers = action.payload
    },
    setMathEngine: (state, action: PayloadAction<'MathJax' | 'KaTeX'>) => {
      state.mathEngine = action.payload
    },
    setMessageStyle: (state, action: PayloadAction<'plain' | 'bubble'>) => {
      state.messageStyle = action.payload
    },
    setCodeStyle: (state, action: PayloadAction<CodeStyleVarious>) => {
      state.codeStyle = action.payload
    }
  }
})

export const {
  setShowAssistants,
  toggleShowAssistants,
  setShowTopics,
  toggleShowTopics,
  setSendMessageShortcut,
  setLanguage,
  setProxyMode,
  setProxyUrl,
  setUserName,
  setShowMessageDivider,
  setMessageFont,
  setShowInputEstimatedTokens,
  setTray,
  setTheme,
  setFontSize,
  setWindowStyle,
  setTopicPosition,
  setShowTopicTime,
  setPasteLongTextAsFile,
  setRenderInputMessageAsMarkdown,
  setClickAssistantToShowTopic,
  setManualUpdateCheck,
  setWebdavHost,
  setWebdavUser,
  setWebdavPass,
  setWebdavPath,
  setCodeShowLineNumbers,
  setMathEngine,
  setMessageStyle,
  setCodeStyle
} = settingsSlice.actions

export default settingsSlice.reducer
