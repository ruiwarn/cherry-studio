import { BrowserWindow, ipcMain, OpenDialogOptions, session, shell } from 'electron'
import Logger from 'electron-log'
import fs from 'fs'
import path from 'path'

import { FileMetadata } from '../renderer/src/types'
import { appConfig, titleBarOverlayDark, titleBarOverlayLight } from './config'
import { File } from './file'
import AppUpdater from './updater'
import { openFile, saveFile } from './utils/file'
import { compress, decompress } from './utils/zip'
import { createMinappWindow } from './window'

const fileManager = new File()

export function registerIpc(mainWindow: BrowserWindow, app: Electron.App) {
  const { autoUpdater } = new AppUpdater(mainWindow)

  // IPC
  ipcMain.handle('get-app-info', () => ({
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    appPath: app.getAppPath()
  }))

  ipcMain.handle('open-website', (_, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('set-proxy', (_, proxy: string) => {
    session.defaultSession.setProxy(proxy ? { proxyRules: proxy } : {})
  })

  ipcMain.handle('save-file', saveFile)
  ipcMain.handle('open-file', openFile)
  ipcMain.handle('reload', () => mainWindow.reload())

  ipcMain.handle('zip:compress', (_, text: string) => compress(text))
  ipcMain.handle('zip:decompress', (_, text: Buffer) => decompress(text))

  ipcMain.handle('image:base64', async (_, filePath) => {
    try {
      const data = await fs.promises.readFile(filePath)
      return `data:image/${path.extname(filePath).slice(1)};base64,${data.toString('base64')}`
    } catch (error) {
      Logger.error('Error reading file:', error)
      return ''
    }
  })

  ipcMain.handle('file:select', async (_, options?: OpenDialogOptions) => await fileManager.selectFile(options))
  ipcMain.handle('file:upload', async (_, file: FileMetadata) => await fileManager.uploadFile(file))
  ipcMain.handle('file:delete', async (_, fileId: string) => {
    await fileManager.deleteFile(fileId)
    return { success: true }
  })
  ipcMain.handle('file:batchUpload', async (_, files: FileMetadata[]) => await fileManager.batchUploadFiles(files))
  ipcMain.handle('file:batchDelete', async (_, fileIds: string[]) => {
    await fileManager.batchDeleteFiles(fileIds)
    return { success: true }
  })
  ipcMain.handle('file:all', () => fileManager.getAllFiles())

  ipcMain.handle('minapp', (_, args) => {
    createMinappWindow({
      url: args.url,
      parent: mainWindow,
      windowOptions: {
        ...mainWindow.getBounds(),
        ...args.windowOptions
      }
    })
  })

  ipcMain.handle('set-theme', (_, theme: 'light' | 'dark') => {
    appConfig.set('theme', theme)
    mainWindow?.setTitleBarOverlay &&
      mainWindow.setTitleBarOverlay(theme === 'dark' ? titleBarOverlayDark : titleBarOverlayLight)
  })

  // 触发检查更新(此方法用于被渲染线程调用，例如页面点击检查更新按钮来调用此方法)
  ipcMain.handle('check-for-update', async () => {
    return {
      currentVersion: autoUpdater.currentVersion,
      update: await autoUpdater.checkForUpdates()
    }
  })
}
