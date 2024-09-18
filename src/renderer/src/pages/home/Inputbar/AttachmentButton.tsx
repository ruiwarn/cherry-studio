import { PaperClipOutlined } from '@ant-design/icons'
import { imageExts, textExts } from '@renderer/config/constant'
import { isVisionModel } from '@renderer/config/models'
import { FileType, Model } from '@renderer/types'
import { Tooltip } from 'antd'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  model: Model
  files: FileType[]
  setFiles: (files: FileType[]) => void
  ToolbarButton: any
}

const AttachmentButton: FC<Props> = ({ model, files, setFiles, ToolbarButton }) => {
  const { t } = useTranslation()
  const extensions = isVisionModel(model) ? [...imageExts, ...textExts] : [...textExts]

  const onSelectFile = async () => {
    if (files.length > 0) {
      return setFiles([])
    }
    const _files = await window.api.file.select({ filters: [{ name: 'Files', extensions }] })
    _files && setFiles(_files)
  }

  return (
    <Tooltip placement="top" title={t('chat.input.upload')} arrow>
      <ToolbarButton type="text" className={files.length ? 'active' : ''} onClick={onSelectFile}>
        <PaperClipOutlined style={{ rotate: '135deg' }} />
      </ToolbarButton>
    </Tooltip>
  )
}

export default AttachmentButton
