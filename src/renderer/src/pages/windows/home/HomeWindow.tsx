import {
  BulbOutlined,
  CloseOutlined,
  CopyOutlined,
  FileTextOutlined,
  MessageOutlined,
  TranslationOutlined
} from '@ant-design/icons'
import ModelAvatar from '@renderer/components/Avatar/ModelAvatar'
import Scrollbar from '@renderer/components/Scrollbar'
import { useProviders } from '@renderer/hooks/useProvider'
import { Col, Divider, Input, Typography } from 'antd'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

const { Paragraph } = Typography

interface HomeWindowProps {
  setRoute: (route: 'home' | 'chat' | 'translate' | 'summary' | 'explanation') => void
}

const HomeWindow: FC<HomeWindowProps> = ({ setRoute }) => {
  const [clipboardContent, setClipboardContent] = useState('')
  const { providers } = useProviders()

  const model = providers[0].models[0]

  useEffect(() => {
    // 读取剪贴板内容
    navigator.clipboard
      .readText()
      .then((text) => {
        setClipboardContent(text)
      })
      .catch((err) => {
        console.error('Failed to read clipboard:', err)
      })
  }, [])

  const features = [
    {
      icon: <MessageOutlined style={{ fontSize: '16px', color: '#fff' }} />,
      title: '回答此问题',
      active: true,
      onClick: () => setRoute('chat')
    },
    {
      icon: <TranslationOutlined style={{ fontSize: '16px', color: '#fff' }} />,
      title: '文本翻译',
      onClick: () => setRoute('translate')
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '16px', color: '#fff' }} />,
      title: '内容总结',
      onClick: () => setRoute('summary')
    },
    {
      icon: <BulbOutlined style={{ fontSize: '16px', color: '#fff' }} />,
      title: '解释说明',
      onClick: () => setRoute('explanation')
    }
  ]

  useEffect(() => {
    window.electron.ipcRenderer.on('hide-mini-window', () => {
      setRoute('home')
    })
  }, [setRoute])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      window.close()
    }
  }

  const clearClipboard = () => {
    setClipboardContent('')
  }

  return (
    <StyledHomeWindow>
      {clipboardContent && (
        <ClipboardPreview>
          <ClipboardContent>
            <CopyOutlined style={{ fontSize: '14px', flexShrink: 0, cursor: 'pointer' }} className="nodrag" />
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{
                margin: '0 12px',
                fontSize: 12,
                flex: 1,
                minWidth: 0
              }}>
              {clipboardContent || '剪贴板为空'}
            </Paragraph>
            <CloseButton onClick={clearClipboard} className="nodrag">
              <CloseOutlined style={{ fontSize: '14px' }} />
            </CloseButton>
          </ClipboardContent>
        </ClipboardPreview>
      )}

      <InputWrapper>
        <ModelAvatar model={model} size={30} />
        <StyledInput
          placeholder={clipboardContent ? '你想对上方文字做什么' : `询问 ${model.name} 获取帮助...`}
          bordered={false}
          autoFocus
          onKeyDown={handleKeyDown}
        />
      </InputWrapper>
      <Divider style={{ margin: '10px 0' }} />

      <FeatureList>
        <FeatureListWrapper>
          {features.map((feature, index) => (
            <Col span={24} key={index}>
              <FeatureItem onClick={feature.onClick} className={feature.active ? 'active' : ''}>
                <FeatureIcon>{feature.icon}</FeatureIcon>
                <FeatureTitle>{feature.title}</FeatureTitle>
              </FeatureItem>
            </Col>
          ))}
        </FeatureListWrapper>
      </FeatureList>
      <Divider style={{ margin: '10px 0' }} />
      <WindowFooter>按 ESC 关闭窗口</WindowFooter>
    </StyledHomeWindow>
  )
}

const StyledHomeWindow = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  -webkit-app-region: drag;
  padding: 10px;
`

const ClipboardPreview = styled.div`
  padding: 12px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
`

const FeatureList = styled(Scrollbar)`
  flex: 1;
  -webkit-app-region: none;
`

const FeatureListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
`

const FeatureItem = styled.div`
  cursor: pointer;
  transition: all 0.3s;
  background: transparent;
  border: none;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  -webkit-app-region: none;
  border-radius: 8px;
  user-select: none;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &.active {
    background: rgba(255, 255, 255, 0.1);
  }
`

const FeatureIcon = styled.div`
  color: #fff;
`

const FeatureTitle = styled.h3`
  margin: 0;
  font-size: 14px;
`

const WindowFooter = styled.div`
  text-align: center;
  padding: 8px 0;
  color: var(--color-text-secondary);
  font-size: 12px;
`

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-top: 10px;
`

const StyledInput = styled(Input)`
  background: none;
  border: none;
  -webkit-app-region: none;
  font-size: 18px;
`

const ClipboardContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  color: var(--color-text-secondary);
`

const CloseButton = styled.button`
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  &:hover {
    color: var(--color-text);
  }
`

export default HomeWindow
