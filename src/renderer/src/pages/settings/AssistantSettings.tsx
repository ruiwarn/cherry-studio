import { QuestionCircleOutlined } from '@ant-design/icons'
import { DEFAULT_CONEXTCOUNT, DEFAULT_MAXTOKENS, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { useDefaultAssistant } from '@renderer/hooks/useAssistant'
import { Button, Col, Input, InputNumber, Row, Slider, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { SettingContainer, SettingDivider, SettingSubtitle, SettingTitle } from './components'

const AssistantSettings: FC = () => {
  const { defaultAssistant, updateDefaultAssistant } = useDefaultAssistant()
  const [temperature, setTemperature] = useState(defaultAssistant.settings?.temperature || DEFAULT_TEMPERATURE)
  const [maxTokens, setMaxTokens] = useState(defaultAssistant.settings?.maxTokens || DEFAULT_MAXTOKENS)
  const [contextCount, setConextCount] = useState(defaultAssistant.settings?.contextCount || DEFAULT_CONEXTCOUNT)

  const { t } = useTranslation()

  const onUpdateAssistantSettings = ({
    _temperature,
    _maxTokens,
    _contextCount
  }: {
    _temperature?: number
    _maxTokens?: number
    _contextCount?: number
  }) => {
    updateDefaultAssistant({
      ...defaultAssistant,
      settings: {
        ...defaultAssistant.settings,
        temperature: _temperature || temperature,
        maxTokens: _maxTokens || maxTokens,
        contextCount: _contextCount || contextCount
      }
    })
  }

  const onTemperatureChange = (value) => {
    if (!isNaN(value as number)) {
      setTemperature(value)
      onUpdateAssistantSettings({ _temperature: value })
    }
  }

  const onMaxTokensChange = (value) => {
    if (!isNaN(value as number)) {
      setMaxTokens(value)
      onUpdateAssistantSettings({ _maxTokens: value })
    }
  }

  const onConextCountChange = (value) => {
    if (!isNaN(value as number)) {
      setConextCount(value)
      onUpdateAssistantSettings({ _contextCount: value })
    }
  }

  const onReset = () => {
    setTemperature(DEFAULT_TEMPERATURE)
    setMaxTokens(DEFAULT_MAXTOKENS)
    setConextCount(DEFAULT_CONEXTCOUNT)
    updateDefaultAssistant({
      ...defaultAssistant,
      settings: {
        ...defaultAssistant.settings,
        temperature: DEFAULT_TEMPERATURE,
        maxTokens: DEFAULT_MAXTOKENS,
        contextCount: DEFAULT_CONEXTCOUNT
      }
    })
  }

  return (
    <SettingContainer>
      <SettingTitle>{t('settings.assistant.title')}</SettingTitle>
      <SettingDivider />
      <SettingSubtitle style={{ marginTop: 0 }}>{t('common.name')}</SettingSubtitle>
      <Input
        placeholder={t('common.assistant') + t('common.name')}
        value={defaultAssistant.name}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, name: e.target.value })}
      />
      <SettingSubtitle>{t('common.prompt')}</SettingSubtitle>
      <TextArea
        rows={4}
        placeholder={t('common.assistant') + t('common.prompt')}
        value={defaultAssistant.prompt}
        onChange={(e) => updateDefaultAssistant({ ...defaultAssistant, prompt: e.target.value })}
      />
      <SettingDivider />
      <SettingSubtitle style={{ marginTop: 0 }}>{t('settings.assistant.model_params')}</SettingSubtitle>
      <Row align="middle">
        <Label>{t('assistant.settings.temperature')}</Label>
        <Tooltip title={t('assistant.settings.temperature.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={22}>
          <Slider
            min={0}
            max={1.2}
            onChange={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            marks={{ 0: '0', 0.7: '0.7', 1: '1', 1.2: '1.2' }}
            step={0.1}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={1.2}
            step={0.1}
            value={temperature}
            onChange={onTemperatureChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('assistant.settings.conext_count')}</Label>
        <Tooltip title={t('assistant.settings.conext_count.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" style={{ marginBottom: 10 }} gutter={20}>
        <Col span={22}>
          <Slider
            min={0}
            max={20}
            marks={{ 0: '0', 5: '5', 10: '10', 15: '15', 20: t('assistant.settings.max') }}
            onChange={onConextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            step={1}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={20}
            step={1}
            value={contextCount}
            onChange={onConextCountChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('assistant.settings.max_tokens')}</Label>
        <Tooltip title={t('assistant.settings.max_tokens.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={20}>
        <Col span={22}>
          <Slider
            min={0}
            max={5000}
            onChange={onMaxTokensChange}
            value={typeof maxTokens === 'number' ? maxTokens : 0}
            marks={{ 0: '0', 800: '800', 2000: '2000', 3600: '3600', 5000: t('assistant.settings.max') }}
            step={64}
          />
        </Col>
        <Col span={2}>
          <InputNumber
            min={0}
            max={5000}
            step={100}
            value={maxTokens}
            onChange={onMaxTokensChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Button onClick={onReset} style={{ width: 100, marginTop: 20 }}>
        {t('assistant.settings.reset')}
      </Button>
    </SettingContainer>
  )
}

const Label = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  margin-right: 5px;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 14px;
  cursor: pointer;
  color: var(--color-text-3);
`

export default AssistantSettings
