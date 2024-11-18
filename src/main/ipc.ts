import path from 'node:path'

import { ThemeMode } from '@types'
import { BrowserWindow, ipcMain, session, shell } from 'electron'

import { titleBarOverlayDark, titleBarOverlayLight } from './config'
import AppUpdater from './services/AppUpdater'
import BackupManager from './services/BackupManager'
import { configManager } from './services/ConfigManager'
import { ExportService } from './services/ExportService'
import FileStorage from './services/FileStorage'
import { windowService } from './services/WindowService'
import { compress, decompress } from './utils/zip'

const fileManager = new FileStorage()
const backupManager = new BackupManager()
const exportService = new ExportService(fileManager)

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  const { autoUpdater } = new AppUpdater(mainWindow)

  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath(),
    filesPath: path.join(app.getPath('userData'), 'Data', 'Files')
  }))

  ipcMain.handle('app:proxy', async (_, proxy: string) => {
    if (proxy === 'system') {
      await session.defaultSession.setProxy({ mode: 'system' })
      const webviewSession = session.fromPartition('persist:webview')
      await webviewSession.setProxy({ mode: 'system' })
    } else if (proxy) {
      await session.defaultSession.setProxy({ proxyRules: proxy })
      const webviewSession = session.fromPartition('persist:webview')
      await webviewSession.setProxy({ proxyRules: proxy })
    } else {
      await session.defaultSession.setProxy({})
      const webviewSession = session.fromPartition('persist:webview')
      await webviewSession.setProxy({})
    }
  })
  ipcMain.handle('app:reload', () => mainWindow.reload())
  ipcMain.handle('open:website', (_, url: string) => shell.openExternal(url))

  // language
  ipcMain.handle('app:set-language', (_, language) => {
    configManager.setLanguage(language)
  })

  // tray
  ipcMain.handle('app:set-tray', (_, isActive: boolean) => {
    configManager.setTray(isActive)
  })

  // theme
  ipcMain.handle('app:set-theme', (_, theme: ThemeMode) => {
    configManager.setTheme(theme)
    mainWindow?.setTitleBarOverlay &&
      mainWindow.setTitleBarOverlay(theme === 'dark' ? titleBarOverlayDark : titleBarOverlayLight)
  })

  // check for update
  ipcMain.handle('app:check-for-update', async () => {
    return {
      currentVersion: autoUpdater.currentVersion,
      update: await autoUpdater.checkForUpdates()
    }
  })

  // zip
  ipcMain.handle('zip:compress', (_, text: string) => compress(text))
  ipcMain.handle('zip:decompress', (_, text: Buffer) => decompress(text))

  // backup
  ipcMain.handle('backup:backup', backupManager.backup)
  ipcMain.handle('backup:restore', backupManager.restore)
  ipcMain.handle('backup:backupToWebdav', backupManager.backupToWebdav)
  ipcMain.handle('backup:restoreFromWebdav', backupManager.restoreFromWebdav)

  // file
  ipcMain.handle('file:open', fileManager.open)
  ipcMain.handle('file:save', fileManager.save)
  ipcMain.handle('file:select', fileManager.selectFile)
  ipcMain.handle('file:upload', fileManager.uploadFile)
  ipcMain.handle('file:clear', fileManager.clear)
  ipcMain.handle('file:read', fileManager.readFile)
  ipcMain.handle('file:delete', fileManager.deleteFile)
  ipcMain.handle('file:get', fileManager.getFile)
  ipcMain.handle('file:selectFolder', fileManager.selectFolder)
  ipcMain.handle('file:create', fileManager.createTempFile)
  ipcMain.handle('file:write', fileManager.writeFile)
  ipcMain.handle('file:saveImage', fileManager.saveImage)
  ipcMain.handle('file:base64Image', fileManager.base64Image)
  ipcMain.handle('file:download', fileManager.downloadFile)
  ipcMain.handle('file:copy', fileManager.copyFile)

  // minapp
  ipcMain.handle('minapp', (_, args) => {
    windowService.createMinappWindow({
      url: args.url,
      parent: mainWindow,
      windowOptions: {
        ...mainWindow.getBounds(),
        ...args.windowOptions
      }
    })
  })

  // export
  ipcMain.handle('export:word', exportService.exportToWord)
}
