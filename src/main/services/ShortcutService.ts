import { Shortcut } from '@types'
import { BrowserWindow, globalShortcut } from 'electron'

import { configManager } from './ConfigManager'

let showAppAccelerator: string | null = null

function getShortcutHandler(shortcut: Shortcut) {
  switch (shortcut.key) {
    case 'zoom_in':
      return (window: BrowserWindow) => handleZoom(0.1)(window)
    case 'zoom_out':
      return (window: BrowserWindow) => handleZoom(-0.1)(window)
    case 'zoom_reset':
      return (window: BrowserWindow) => {
        window.webContents.setZoomFactor(1)
        configManager.setZoomFactor(1)
      }
    case 'show_app':
      return (window: BrowserWindow) => {
        if (window.isVisible()) {
          window.hide()
        } else {
          window.show()
          window.focus()
        }
      }
    default:
      return null
  }
}

function formatShortcutKey(shortcut: string[]): string {
  return shortcut.join('+')
}

function handleZoom(delta: number) {
  return (window: BrowserWindow) => {
    const currentZoom = window.webContents.getZoomFactor()
    const newZoom = currentZoom + delta
    if (newZoom >= 0.1 && newZoom <= 5.0) {
      window.webContents.setZoomFactor(newZoom)
      configManager.setZoomFactor(newZoom)
    }
  }
}

export function registerShortcuts(window: BrowserWindow) {
  window.webContents.setZoomFactor(configManager.getZoomFactor())

  const register = () => {
    if (window.isDestroyed()) return

    const shortcuts = configManager.getShortcuts()
    if (!shortcuts) return

    shortcuts.forEach((shortcut) => {
      if (shortcut.shortcut.length === 0) {
        return
      }

      const handler = getShortcutHandler(shortcut)

      if (!handler) {
        return
      }

      const accelerator = formatShortcutKey(shortcut.shortcut)

      if (shortcut.key === 'show_app') {
        showAppAccelerator = accelerator
      }

      if (shortcut.key.includes('zoom')) {
        switch (shortcut.key) {
          case 'zoom_in':
            globalShortcut.register('CommandOrControl+=', () => shortcut.enabled && handler(window))
            globalShortcut.register('CommandOrControl+numadd', () => shortcut.enabled && handler(window))
            return
          case 'zoom_out':
            globalShortcut.register('CommandOrControl+-', () => shortcut.enabled && handler(window))
            globalShortcut.register('CommandOrControl+numsub', () => shortcut.enabled && handler(window))
            return
          case 'zoom_reset':
            globalShortcut.register('CommandOrControl+0', () => shortcut.enabled && handler(window))
            return
        }
      }

      if (shortcut.enabled) {
        globalShortcut.register(accelerator, () => handler(window))
      }
    })
  }

  const unregister = () => {
    if (window.isDestroyed()) return

    globalShortcut.unregisterAll()

    if (showAppAccelerator) {
      const handler = getShortcutHandler({ key: 'show_app' } as Shortcut)
      handler && globalShortcut.register(showAppAccelerator, () => handler(window))
    }
  }

  window.on('focus', () => register())
  window.on('blur', () => unregister())

  if (!window.isDestroyed() && window.isFocused()) {
    register()
  }
}

export function unregisterAllShortcuts() {
  showAppAccelerator = null
  globalShortcut.unregisterAll()
}
