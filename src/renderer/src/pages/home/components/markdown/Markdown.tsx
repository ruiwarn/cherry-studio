import 'katex/dist/katex.min.css'

import { Message } from '@renderer/types'
import { isEmpty } from 'lodash'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodeBlock from './CodeBlock'
import Link from './Link'

interface Props {
  message: Message
}

const Markdown: FC<Props> = ({ message }) => {
  const { t } = useTranslation()

  const getMessageContent = useCallback(
    (message: Message) => {
      const empty = isEmpty(message.content)
      const paused = message.status === 'paused'
      return empty && paused ? t('message.chat.completion.paused') : message.content
    },
    [t]
  )

  return useMemo(() => {
    return (
      <ReactMarkdown
        className="markdown"
        remarkPlugins={[remarkGfm, remarkMath]}
        remarkRehypeOptions={{ footnoteLabel: t('common.footnote'), footnoteLabelTagName: 'h4' }}
        rehypePlugins={[rehypeKatex]}
        components={{ code: CodeBlock as any, a: Link as any }}>
        {getMessageContent(message)}
      </ReactMarkdown>
    )
  }, [getMessageContent, message, t])
}

export default Markdown
