import { DeleteOutlined } from '@ant-design/icons'
import { FileMetadataResponse, FileState } from '@google/generative-ai/server'
import { useProvider } from '@renderer/hooks/useProvider'
import GeminiProvider from '@renderer/providers/GeminiProvider'
import { runAsyncFunction } from '@renderer/utils'
import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface GeminiFilesProps {
  id: string
}

const GeminiFiles: FC<GeminiFilesProps> = ({ id }) => {
  const { provider } = useProvider(id)
  const [files, setFiles] = useState<FileMetadataResponse[]>([])
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const fetchFiles = useCallback(async () => {
    const geminiProvider = new GeminiProvider(provider)
    const { files } = await geminiProvider.listFiles()
    files && setFiles(files.filter((file) => file.state === FileState.ACTIVE))
  }, [provider])

  const columns: ColumnsType<FileMetadataResponse> = [
    {
      title: t('files.name'),
      dataIndex: 'displayName',
      key: 'displayName'
    },
    {
      title: t('files.type'),
      dataIndex: 'mimeType',
      key: 'mimeType'
    },
    {
      title: t('files.size'),
      dataIndex: 'sizeBytes',
      key: 'sizeBytes',
      render: (size: string) => `${(parseInt(size) / 1024 / 1024).toFixed(2)} MB`
    },
    {
      title: t('files.created_at'),
      dataIndex: 'createTime',
      key: 'createTime',
      render: (time: string) => new Date(time).toLocaleString()
    },
    {
      title: t('files.actions'),
      dataIndex: 'actions',
      key: 'actions',
      align: 'center',
      render: (_, record) => {
        const geminiProvider = new GeminiProvider(provider)
        return (
          <DeleteOutlined
            style={{ cursor: 'pointer', color: 'var(--color-error)' }}
            onClick={() => {
              setFiles(files.filter((file) => file.name !== record.name))
              geminiProvider.deleteFile(record.name).catch((error) => {
                console.error('Failed to delete file:', error)
                setFiles((prev) => [...prev, record])
              })
            }}
          />
        )
      }
    }
  ]

  useEffect(() => {
    runAsyncFunction(async () => {
      try {
        setLoading(true)
        await fetchFiles()
        setLoading(false)
      } catch (error: any) {
        console.error('Failed to fetch files:', error)
        window.message.error(error.message)
        setLoading(false)
      }
    })
  }, [fetchFiles])

  useEffect(() => {
    setFiles([])
  }, [id])

  return (
    <Container>
      <Table columns={columns} dataSource={files} rowKey="name" loading={loading} />
    </Container>
  )
}

const Container = styled.div``

export default GeminiFiles
