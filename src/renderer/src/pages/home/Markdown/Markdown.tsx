import 'katex/dist/katex.min.css'

import { useSettings } from '@renderer/hooks/useSettings'
import { Message } from '@renderer/types'
import { addPlaintextToCodeBlock, escapeBrackets } from '@renderer/utils/formula'
import { isEmpty } from 'lodash'
import { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import ReactMarkdown, { Components } from 'react-markdown'
import rehypeKatex from 'rehype-katex'
// @ts-ignore next-line
import rehypeMathjax from 'rehype-mathjax'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import CodeBlock from './CodeBlock'
import ImagePreview from './ImagePreview'
import Link from './Link'

const ALLOWED_ELEMENTS =
  /<(style|p|div|span|b|i|strong|em|ul|ol|li|table|tr|td|th|thead|tbody|h[1-6]|blockquote|pre|code|br|hr)/i

interface Props {
  message: Message
}

const Markdown: FC<Props> = ({ message }) => {
  const { t } = useTranslation()
  const { renderInputMessageAsMarkdown, mathEngine } = useSettings()

  const rehypeMath = mathEngine === 'KaTeX' ? rehypeKatex : rehypeMathjax

  const messageContent = useMemo(() => {
    const empty = isEmpty(message.content)
    const paused = message.status === 'paused'
    const content = empty && paused ? t('message.chat.completion.paused') : message.content
    return escapeBrackets(addPlaintextToCodeBlock(content))
  }, [message.content, message.status, t])

  const rehypePlugins = useMemo(() => {
    const hasElements = ALLOWED_ELEMENTS.test(messageContent)
    return hasElements ? [rehypeRaw, rehypeMath] : [rehypeMath]
  }, [messageContent, rehypeMath])

  if (message.role === 'user' && !renderInputMessageAsMarkdown) {
    return <p style={{ marginBottom: 5, whiteSpace: 'pre-wrap' }}>{messageContent}</p>
  }

  return (
    <ReactMarkdown
      className="markdown"
      rehypePlugins={rehypePlugins}
      remarkPlugins={[remarkMath, remarkGfm]}
      disallowedElements={mathEngine === 'KaTeX' ? ['style'] : []}
      components={
        {
          a: Link,
          code: CodeBlock,
          img: ImagePreview
        } as Partial<Components>
      }
      remarkRehypeOptions={{
        footnoteLabel: t('common.footnotes'),
        footnoteLabelTagName: 'h4',
        footnoteBackContent: ' '
      }}>
      {messageContent}
    </ReactMarkdown>
  )
}

export default Markdown
