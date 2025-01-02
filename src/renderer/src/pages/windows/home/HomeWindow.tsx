import { BulbOutlined, FileTextOutlined, MessageOutlined, TranslationOutlined } from '@ant-design/icons'
import { useTheme } from '@renderer/context/ThemeProvider'
import { ThemeMode } from '@renderer/types'
import { Card, Col, Row, Typography } from 'antd'
import { FC, useEffect, useState } from 'react'
import styled from 'styled-components'

const { Paragraph } = Typography

const HomeWindow: FC = () => {
  const [clipboardContent, setClipboardContent] = useState('')
  const { theme } = useTheme()

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
      icon: <MessageOutlined style={{ fontSize: '24px', color: '#fff' }} />,
      title: 'AI 对话',
      description: '与 AI 进行智能对话，获取帮助和建议',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
    },
    {
      icon: <TranslationOutlined style={{ fontSize: '24px', color: '#fff' }} />,
      title: '文本翻译',
      description: '快速翻译各种语言文本',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
    },
    {
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#fff' }} />,
      title: '内容总结',
      description: '自动生成文本内容的简要总结',
      gradient: 'linear-gradient(135deg, #f97316 0%, #c2410c 100%)'
    },
    {
      icon: <BulbOutlined style={{ fontSize: '24px', color: '#fff' }} />,
      title: '解释说明',
      description: '获取代码或专业术语的详细解释',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)'
    }
  ]

  return (
    <Container>
      <ClipboardSection theme={theme}>
        <Paragraph ellipsis={{ rows: 3 }} style={{ margin: 0 }}>
          {clipboardContent || '剪贴板为空'}
        </Paragraph>
      </ClipboardSection>

      <FeaturesGrid>
        <Row gutter={[8, 8]}>
          {features.map((feature, index) => (
            <Col span={12} key={index}>
              <FeatureCard gradient={feature.gradient}>
                <IconWrapper>{feature.icon}</IconWrapper>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </FeatureCard>
            </Col>
          ))}
        </Row>
      </FeaturesGrid>
    </Container>
  )
}

const Container = styled.div`
  padding: 16px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  -webkit-app-region: drag;
`

const ClipboardSection = styled.div<{ theme: ThemeMode }>`
  padding: 12px;
  background-color: ${(props) => (props.theme === 'dark' ? '#1f1f1f' : '#f5f5f5')};
  border-radius: 8px;
`

const FeaturesGrid = styled.div`
  flex: 1;
`

const FeatureCard = styled(Card)<{ gradient: string }>`
  cursor: pointer;
  transition: all 0.3s;
  height: 100%;
  background: ${(props) => props.gradient};
  border: none;
  cursor: pointer;
  -webkit-app-region: none;

  .ant-card-body {
    padding: 16px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`

const IconWrapper = styled.div`
  margin-bottom: 12px;
  color: #fff;
`

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #fff;
`

const CardDescription = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
`

export default HomeWindow
