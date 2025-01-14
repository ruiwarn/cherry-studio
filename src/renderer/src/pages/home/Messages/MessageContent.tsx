import { SyncOutlined, TranslationOutlined } from '@ant-design/icons'
import { Message, Model } from '@renderer/types'
import { getBriefInfo } from '@renderer/utils'
import { Divider } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'
import BeatLoader from 'react-spinners/BeatLoader'
import styled from 'styled-components'

import Markdown from '../Markdown/Markdown'
import MessageAttachments from './MessageAttachments'
import MessageError from './MessageError'
import MessageSearchResults from './MessageSearchResults'

const MessageContent: React.FC<{
  message: Message
  model?: Model
}> = ({ message, model }) => {
  const { t } = useTranslation()

  if (message.status === 'sending') {
    return (
      <MessageContentLoading>
        <SyncOutlined spin size={24} />
      </MessageContentLoading>
    )
  }

  if (message.status === 'error') {
    return <MessageError message={message} />
  }

  if (message.type === '@' && model) {
    const content = `[@${model.name}](#)  ${getBriefInfo(message.content)}`
    return <Markdown message={{ ...message, content }} />
  }

  return (
    <>
      <Markdown message={message} />
      {message.translatedContent && (
        <>
          <Divider style={{ margin: 0, marginBottom: 10 }}>
            <TranslationOutlined />
          </Divider>
          {message.translatedContent === t('translate.processing') ? (
            <BeatLoader color="var(--color-text-2)" size="10" style={{ marginBottom: 15 }} />
          ) : (
            <Markdown message={{ ...message, content: message.translatedContent }} />
          )}
        </>
      )}
      <MessageAttachments message={message} />
      <MessageSearchResults message={message} />
    </>
  )
}

const MessageContentLoading = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 32px;
  margin-top: -5px;
  margin-bottom: 5px;
`

export default React.memo(MessageContent)
