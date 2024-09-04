import { CheckOutlined, QuestionCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { HStack } from '@renderer/components/Layout'
import { DEFAULT_CONEXTCOUNT, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useAssistant } from '@renderer/hooks/useAssistant'
import { useSettings } from '@renderer/hooks/useSettings'
import { SettingDivider, SettingRow, SettingRowTitle, SettingSubtitle } from '@renderer/pages/settings'
import { useAppDispatch } from '@renderer/store'
import {
  setFontSize,
  setMessageFont,
  setShowInputEstimatedTokens,
  setShowMessageDivider
} from '@renderer/store/settings'
import { Assistant, AssistantSettings } from '@renderer/types'
import { Col, Row, Select, Slider, Switch, Tooltip } from 'antd'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
}

const SettingsTab: FC<Props> = (props) => {
  const { assistant, updateAssistantSettings, updateAssistant } = useAssistant(props.assistant.id)
  const { fontSize } = useSettings()
  const [temperature, setTemperature] = useState(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [contextCount, setConextCount] = useState(assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
  const [enableMaxTokens, setEnableMaxTokens] = useState(assistant?.settings?.enableMaxTokens ?? false)
  const [maxTokens, setMaxTokens] = useState(assistant?.settings?.maxTokens ?? 0)
  const [fontSizeValue, setFontSizeValue] = useState(fontSize)
  const { t } = useTranslation()

  const dispatch = useAppDispatch()

  const { showMessageDivider, messageFont, showInputEstimatedTokens, sendMessageShortcut, setSendMessageShortcut } =
    useSettings()

  const onUpdateAssistantSettings = (settings: Partial<AssistantSettings>) => {
    updateAssistantSettings({
      temperature: settings.temperature ?? temperature,
      contextCount: settings.contextCount ?? contextCount,
      enableMaxTokens: settings.enableMaxTokens ?? enableMaxTokens,
      maxTokens: settings.maxTokens ?? maxTokens
    })
  }

  const onTemperatureChange = (value) => {
    if (!isNaN(value as number)) {
      onUpdateAssistantSettings({ temperature: value })
    }
  }

  const onConextCountChange = (value) => {
    if (!isNaN(value as number)) {
      onUpdateAssistantSettings({ contextCount: value })
    }
  }

  const onMaxTokensChange = (value) => {
    if (!isNaN(value as number)) {
      onUpdateAssistantSettings({ maxTokens: value })
    }
  }

  const onReset = () => {
    setTemperature(DEFAULT_TEMPERATURE)
    setConextCount(DEFAULT_CONEXTCOUNT)
    updateAssistant({
      ...assistant,
      settings: {
        ...assistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        contextCount: DEFAULT_CONEXTCOUNT,
        enableMaxTokens: false,
        maxTokens: DEFAULT_MAX_TOKENS
      }
    })
  }

  useEffect(() => {
    setTemperature(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
    setConextCount(assistant?.settings?.contextCount ?? DEFAULT_CONEXTCOUNT)
    setEnableMaxTokens(assistant?.settings?.enableMaxTokens ?? false)
    setMaxTokens(assistant?.settings?.maxTokens ?? DEFAULT_MAX_TOKENS)
  }, [assistant])

  return (
    <Container>
      <SettingSubtitle>
        {t('settings.messages.model.title')}{' '}
        <Tooltip title={t('chat.settings.reset')}>
          <ReloadOutlined onClick={onReset} style={{ cursor: 'pointer', fontSize: 12, padding: '0 3px' }} />
        </Tooltip>
      </SettingSubtitle>
      <SettingDivider />
      <Row align="middle">
        <Label>{t('chat.settings.temperature')}</Label>
        <Tooltip title={t('chat.settings.temperature.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={10}>
        <Col span={24}>
          <Slider
            min={0}
            max={1.2}
            onChange={setTemperature}
            onChangeComplete={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            step={0.1}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('chat.settings.conext_count')}</Label>
        <Tooltip title={t('chat.settings.conext_count.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={10}>
        <Col span={24}>
          <Slider
            min={0}
            max={20}
            onChange={setConextCount}
            onChangeComplete={onConextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            step={1}
          />
        </Col>
      </Row>
      <Row align="middle" justify="space-between">
        <HStack alignItems="center">
          <Label>{t('chat.settings.max_tokens')}</Label>
          <Tooltip title={t('chat.settings.max_tokens.tip')}>
            <QuestionIcon />
          </Tooltip>
        </HStack>
        <Switch
          size="small"
          checked={enableMaxTokens}
          onChange={(enabled) => {
            setEnableMaxTokens(enabled)
            onUpdateAssistantSettings({ enableMaxTokens: enabled })
          }}
        />
      </Row>
      <Row align="middle" gutter={10}>
        <Col span={24}>
          <Slider
            disabled={!enableMaxTokens}
            min={0}
            max={32000}
            onChange={setMaxTokens}
            onChangeComplete={onMaxTokensChange}
            value={typeof maxTokens === 'number' ? maxTokens : 0}
            step={100}
          />
        </Col>
      </Row>
      <SettingSubtitle>{t('settings.messages.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.divider')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={showMessageDivider}
          onChange={(checked) => dispatch(setShowMessageDivider(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.use_serif_font')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={messageFont === 'serif'}
          onChange={(checked) => dispatch(setMessageFont(checked ? 'serif' : 'system'))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.font_size.title')}</SettingRowTitleSmall>
      </SettingRow>
      <Row align="middle" gutter={10}>
        <Col span={24}>
          <Slider
            value={fontSizeValue}
            onChange={(value) => setFontSizeValue(value)}
            onChangeComplete={(value) => {
              dispatch(setFontSize(value))
              console.debug('set font size', value)
            }}
            min={12}
            max={18}
            step={1}
            marks={{
              12: <span style={{ fontSize: '12px' }}>A</span>,
              14: <span style={{ fontSize: '14px' }}>{t('common.default')}</span>,
              18: <span style={{ fontSize: '18px' }}>A</span>
            }}
          />
        </Col>
      </Row>
      <SettingSubtitle>{t('settings.messages.input.title')}</SettingSubtitle>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.show_estimated_tokens')}</SettingRowTitleSmall>
        <Switch
          size="small"
          checked={showInputEstimatedTokens}
          onChange={(checked) => dispatch(setShowInputEstimatedTokens(checked))}
        />
      </SettingRow>
      <SettingDivider />
      <SettingRow>
        <SettingRowTitleSmall>{t('settings.messages.input.send_shortcuts')}</SettingRowTitleSmall>
      </SettingRow>
      <Select
        value={sendMessageShortcut}
        menuItemSelectedIcon={<CheckOutlined />}
        options={[
          { value: 'Enter', label: `Enter ${t('chat.input.send')}` },
          { value: 'Shift+Enter', label: `Shift + Enter ${t('chat.input.send')}` }
        ]}
        onChange={(value) => setSendMessageShortcut(value)}
        style={{ width: '100%', marginTop: 10 }}
      />
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: var(--topic-list-width);
  max-width: var(--topic-list-width);
  height: calc(100vh - var(--navbar-height));
  border-left: 0.5px solid var(--color-border);
  padding: 0 15px;
  padding-bottom: 20px;
  overflow-y: auto;
`

const Label = styled.p`
  margin: 0;
  font-size: 12px;
  margin-right: 5px;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-3);
`

const SettingRowTitleSmall = styled(SettingRowTitle)`
  font-size: 13px;
`

export default SettingsTab
