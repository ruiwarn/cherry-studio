import { LanguageVarious, ThemeMode } from '@types'
import { app } from 'electron'
import Store from 'electron-store'

import { locales } from '../utils/locales'

export class ConfigManager {
  private store: Store
  private subscribers: Map<string, Array<(newValue: any) => void>> = new Map()

  constructor() {
    this.store = new Store()
  }

  getLanguage(): LanguageVarious {
    const locale = Object.keys(locales).includes(app.getLocale()) ? app.getLocale() : 'en-US'
    return this.store.get('language', locale) as LanguageVarious
  }

  setLanguage(theme: LanguageVarious) {
    this.store.set('language', theme)
  }

  getTheme(): ThemeMode {
    return this.store.get('theme', ThemeMode.light) as ThemeMode
  }

  setTheme(theme: ThemeMode) {
    this.store.set('theme', theme)
  }

  isTray(): boolean {
    return !!this.store.get('tray', true)
  }

  setTray(value: boolean) {
    this.store.set('tray', value)
    this.notifySubscribers('tray', value)
  }

  getZoomFactor(): number {
    return this.store.get('zoomFactor', 1) as number
  }

  setZoomFactor(factor: number) {
    this.store.set('zoomFactor', factor)
    this.notifySubscribers('zoomFactor', factor)
  }

  subscribe<T>(key: string, callback: (newValue: T) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    this.subscribers.get(key)!.push(callback)
  }

  unsubscribe<T>(key: string, callback: (newValue: T) => void) {
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      this.subscribers.set(
        key,
        subscribers.filter((subscriber) => subscriber !== callback)
      )
    }
  }

  private notifySubscribers<T>(key: string, newValue: T) {
    const subscribers = this.subscribers.get(key)
    if (subscribers) {
      subscribers.forEach((subscriber) => subscriber(newValue))
    }
  }

  getShortcuts() {
    return this.store.get('shortcuts') as Shortcut[] | undefined
  }

  setShortcuts(shortcuts: Shortcut[]) {
    this.store.set('shortcuts', shortcuts)
    this.notifySubscribers('shortcuts', shortcuts)
  }
}

export const configManager = new ConfigManager()
