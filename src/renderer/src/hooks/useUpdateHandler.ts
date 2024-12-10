import { useAppDispatch } from '@renderer/store'
import { setUpdateState } from '@renderer/store/runtime'
import type { ProgressInfo, UpdateInfo } from 'electron-updater'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function useUpdateHandler() {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  useEffect(() => {
    const ipcRenderer = window.electron.ipcRenderer
    const removers = [
      ipcRenderer.on('update-not-available', () => {
        dispatch(setUpdateState({ checking: false }))
        if (window.location.hash.includes('settings/about')) {
          window.message.success(t('settings.about.updateNotAvailable'))
        }
      }),
      ipcRenderer.on('update-available', (_, releaseInfo: UpdateInfo) => {
        dispatch(
          setUpdateState({
            checking: false,
            downloading: true,
            info: releaseInfo,
            available: true
          })
        )
      }),
      ipcRenderer.on('download-update', () => {
        dispatch(
          setUpdateState({
            checking: false,
            downloading: true
          })
        )
      }),
      ipcRenderer.on('download-progress', (_, progress: ProgressInfo) => {
        dispatch(
          setUpdateState({
            downloading: progress.percent < 100,
            downloadProgress: progress.percent
          })
        )
      }),
      ipcRenderer.on('update-downloaded', () => {
        dispatch(setUpdateState({ downloading: false }))
      }),
      ipcRenderer.on('update-error', (_, error) => {
        dispatch(
          setUpdateState({
            checking: false,
            downloading: false,
            downloadProgress: 0
          })
        )
        window.modal.info({
          title: t('settings.about.updateError'),
          content: error?.message || t('settings.about.updateError'),
          icon: null
        })
      })
    ]
    return () => removers.forEach((remover) => remover())
  }, [dispatch, t])
}
