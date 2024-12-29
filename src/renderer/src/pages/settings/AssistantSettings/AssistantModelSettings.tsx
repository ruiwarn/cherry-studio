import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import ModelAvatar from '@renderer/components/Avatar/ModelAvatar'
import { HStack } from '@renderer/components/Layout'
import SelectModelPopup from '@renderer/components/Popups/SelectModelPopup'
import { DEFAULT_CONTEXTCOUNT, DEFAULT_TEMPERATURE } from '@renderer/config/constant'
import { SettingRow } from '@renderer/pages/settings'
import { Assistant, AssistantSettings } from '@renderer/types'
import { Button, Col, Divider, Input, InputNumber, Row, Select, Slider, Switch, Tooltip } from 'antd'
import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface Props {
  assistant: Assistant
  updateAssistant: (assistant: Assistant) => void
  updateAssistantSettings: (settings: Partial<AssistantSettings>) => void
}

const AssistantModelSettings: FC<Props> = ({ assistant, updateAssistant, updateAssistantSettings }) => {
  const [temperature, setTemperature] = useState(assistant?.settings?.temperature ?? DEFAULT_TEMPERATURE)
  const [contextCount, setContextCount] = useState(assistant?.settings?.contextCount ?? DEFAULT_CONTEXTCOUNT)
  const [enableMaxTokens, setEnableMaxTokens] = useState(assistant?.settings?.enableMaxTokens ?? false)
  const [maxTokens, setMaxTokens] = useState(assistant?.settings?.maxTokens ?? 0)
  const [autoResetModel, setAutoResetModel] = useState(assistant?.settings?.autoResetModel ?? false)
  const [streamOutput, setStreamOutput] = useState(assistant?.settings?.streamOutput ?? true)
  const [defaultModel, setDefaultModel] = useState(assistant?.defaultModel)
  const [topP, setTopP] = useState(assistant?.settings?.topP ?? 1)
  const [customParameters, setCustomParameters] = useState<
    Array<{
      name: string
      value: string | number | boolean
      type: 'string' | 'number' | 'boolean'
    }>
  >(assistant?.settings?.customParameters ?? [])
  const { t } = useTranslation()

  const onTemperatureChange = (value) => {
    if (!isNaN(value as number)) {
      updateAssistantSettings({ temperature: value })
    }
  }

  const onContextCountChange = (value) => {
    if (!isNaN(value as number)) {
      updateAssistantSettings({ contextCount: value })
    }
  }

  const onMaxTokensChange = (value) => {
    if (!isNaN(value as number)) {
      updateAssistantSettings({ maxTokens: value })
    }
  }

  const onTopPChange = (value) => {
    if (!isNaN(value as number)) {
      updateAssistantSettings({ topP: value })
    }
  }

  const onAddCustomParameter = () => {
    const newParam = { name: '', value: '', type: 'string' as const }
    const newParams = [...customParameters, newParam]
    setCustomParameters(newParams)
    updateAssistantSettings({ customParameters: newParams })
  }

  const onUpdateCustomParameter = (
    index: number,
    field: 'name' | 'value' | 'type',
    value: string | number | boolean
  ) => {
    const newParams = [...customParameters]
    if (field === 'type') {
      let defaultValue: any = ''
      switch (value) {
        case 'number':
          defaultValue = 0
          break
        case 'boolean':
          defaultValue = false
          break
        default:
          defaultValue = ''
      }
      newParams[index] = {
        ...newParams[index],
        type: value as any,
        value: defaultValue
      }
    } else {
      newParams[index] = { ...newParams[index], [field]: value }
    }
    setCustomParameters(newParams)
    updateAssistantSettings({ customParameters: newParams })
  }

  const renderParameterValueInput = (param: (typeof customParameters)[0], index: number) => {
    switch (param.type) {
      case 'number':
        return (
          <InputNumber
            style={{ width: '100%' }}
            value={param.value as number}
            onChange={(value) => onUpdateCustomParameter(index, 'value', value || 0)}
            step={0.01}
          />
        )
      case 'boolean':
        return (
          <Switch
            checked={param.value as boolean}
            onChange={(checked) => onUpdateCustomParameter(index, 'value', checked)}
          />
        )
      default:
        return (
          <Input
            value={param.value as string}
            onChange={(e) => onUpdateCustomParameter(index, 'value', e.target.value)}
          />
        )
    }
  }

  const onDeleteCustomParameter = (index: number) => {
    const newParams = customParameters.filter((_, i) => i !== index)
    setCustomParameters(newParams)
    updateAssistantSettings({ customParameters: newParams })
  }

  const onReset = () => {
    setTemperature(DEFAULT_TEMPERATURE)
    setContextCount(DEFAULT_CONTEXTCOUNT)
    setEnableMaxTokens(false)
    setMaxTokens(0)
    setStreamOutput(true)
    setTopP(1)
    setCustomParameters([])
    updateAssistantSettings({
      temperature: DEFAULT_TEMPERATURE,
      contextCount: DEFAULT_CONTEXTCOUNT,
      enableMaxTokens: false,
      maxTokens: 0,
      streamOutput: true,
      topP: 1,
      customParameters: []
    })
  }

  const onSelectModel = async () => {
    const selectedModel = await SelectModelPopup.show({ model: assistant?.model })
    if (selectedModel) {
      setDefaultModel(selectedModel)
      updateAssistant({
        ...assistant,
        defaultModel: selectedModel
      })
    }
  }

  return (
    <Container>
      <Row align="middle" style={{ marginBottom: 10 }}>
        <Label style={{ marginBottom: 10 }}>{t('assistants.settings.default_model')}</Label>
        <Col span={24}>
          <HStack alignItems="center">
            <Button
              icon={defaultModel ? <ModelAvatar model={defaultModel} size={20} /> : <PlusOutlined />}
              onClick={onSelectModel}>
              {defaultModel ? defaultModel.name : t('agents.edit.model.select.title')}
            </Button>
          </HStack>
        </Col>
      </Row>
      <Divider style={{ margin: '10px 0' }} />
      <SettingRow style={{ minHeight: 30 }}>
        <Label>
          {t('assistants.settings.auto_reset_model')}{' '}
          <Tooltip title={t('assistants.settings.auto_reset_model.tip')}>
            <QuestionIcon />
          </Tooltip>
        </Label>
        <Switch
          value={autoResetModel}
          onChange={(checked) => {
            setAutoResetModel(checked)
            updateAssistantSettings({ autoResetModel: checked })
          }}
        />
      </SettingRow>
      <Divider style={{ margin: '10px 0' }} />
      <Row align="middle">
        <Label>{t('chat.settings.temperature')}</Label>
        <Tooltip title={t('chat.settings.temperature.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={20}>
        <Col span={21}>
          <Slider
            min={0}
            max={2}
            onChange={setTemperature}
            onChangeComplete={onTemperatureChange}
            value={typeof temperature === 'number' ? temperature : 0}
            marks={{ 0: '0', 0.7: '0.7', 2: '2' }}
            step={0.01}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            min={0}
            max={2}
            step={0.01}
            value={temperature}
            onChange={onTemperatureChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Row align="middle">
        <Label>{t('chat.settings.top_p')}</Label>
        <Tooltip title={t('chat.settings.top_p.tip')}>
          <QuestionIcon />
        </Tooltip>
      </Row>
      <Row align="middle" gutter={20}>
        <Col span={21}>
          <Slider
            min={0}
            max={1}
            onChange={setTopP}
            onChangeComplete={onTopPChange}
            value={typeof topP === 'number' ? topP : 1}
            marks={{ 0: '0', 1: '1' }}
            step={0.01}
          />
        </Col>
        <Col span={3}>
          <InputNumber min={0} max={1} step={0.01} value={topP} onChange={onTopPChange} style={{ width: '100%' }} />
        </Col>
      </Row>
      <Row align="middle">
        <Label>
          {t('chat.settings.context_count')}{' '}
          <Tooltip title={t('chat.settings.context_count.tip')}>
            <QuestionIcon />
          </Tooltip>
        </Label>
      </Row>
      <Row align="middle" gutter={20}>
        <Col span={21}>
          <Slider
            min={0}
            max={20}
            onChange={setContextCount}
            onChangeComplete={onContextCountChange}
            value={typeof contextCount === 'number' ? contextCount : 0}
            marks={{ 0: '0', 5: '5', 10: '10', 15: '15', 20: t('chat.settings.max') }}
            step={1}
          />
        </Col>
        <Col span={3}>
          <InputNumber
            min={0}
            max={20}
            step={1}
            value={contextCount}
            onChange={onContextCountChange}
            style={{ width: '100%' }}
          />
        </Col>
      </Row>
      <Divider style={{ margin: '10px 0' }} />
      <SettingRow style={{ minHeight: 30 }}>
        <HStack alignItems="center">
          <Label>{t('chat.settings.max_tokens')}</Label>
          <Tooltip title={t('chat.settings.max_tokens.tip')}>
            <QuestionIcon />
          </Tooltip>
        </HStack>
        <Switch
          checked={enableMaxTokens}
          onChange={(enabled) => {
            setEnableMaxTokens(enabled)
            updateAssistantSettings({ enableMaxTokens: enabled })
          }}
        />
      </SettingRow>
      {enableMaxTokens && (
        <Row align="middle" gutter={20}>
          <Col span={21}>
            <Slider
              disabled={!enableMaxTokens}
              min={0}
              max={32000}
              onChange={setMaxTokens}
              onChangeComplete={onMaxTokensChange}
              value={typeof maxTokens === 'number' ? maxTokens : 0}
              step={100}
              marks={{
                0: '0',
                32000: t('chat.settings.max')
              }}
            />
          </Col>
          <Col span={3}>
            <InputNumber
              disabled={!enableMaxTokens}
              min={0}
              max={32000}
              step={100}
              value={maxTokens}
              onChange={onMaxTokensChange}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      )}
      <Divider style={{ margin: '10px 0' }} />
      <SettingRow style={{ minHeight: 30 }}>
        <Label>{t('models.stream_output')}</Label>
        <Switch
          checked={streamOutput}
          onChange={(checked) => {
            setStreamOutput(checked)
            updateAssistantSettings({ streamOutput: checked })
          }}
        />
      </SettingRow>
      <Divider style={{ margin: '10px 0' }} />
      <SettingRow style={{ minHeight: 30 }}>
        <Label>{t('models.custom_parameters')}</Label>
        <Button icon={<PlusOutlined />} onClick={onAddCustomParameter}>
          {t('models.add_parameter')}
        </Button>
      </SettingRow>
      {customParameters.map((param, index) => (
        <Row key={index} align="middle" gutter={10} style={{ marginTop: 10 }}>
          <Col span={6}>
            <Input
              placeholder={t('models.parameter_name')}
              value={param.name}
              onChange={(e) => onUpdateCustomParameter(index, 'name', e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              value={param.type}
              onChange={(value) => onUpdateCustomParameter(index, 'type', value)}
              style={{ width: '100%' }}>
              <Select.Option value="string">{t('models.parameter_type.string')}</Select.Option>
              <Select.Option value="number">{t('models.parameter_type.number')}</Select.Option>
              <Select.Option value="boolean">{t('models.parameter_type.boolean')}</Select.Option>
            </Select>
          </Col>
          <Col span={11}>{renderParameterValueInput(param, index)}</Col>
          <Col span={3}>
            <Button icon={<DeleteOutlined />} onClick={() => onDeleteCustomParameter(index)} danger />
          </Col>
        </Row>
      ))}
      <Divider style={{ margin: '15px 0' }} />
      <HStack justifyContent="flex-end">
        <Button onClick={onReset} style={{ width: 80 }} danger type="primary">
          {t('chat.settings.reset')}
        </Button>
      </HStack>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
  padding: 5px;
`

const Label = styled.p`
  margin-right: 5px;
  font-weight: 500;
`

const QuestionIcon = styled(QuestionCircleOutlined)`
  font-size: 12px;
  cursor: pointer;
  color: var(--color-text-3);
`

export default AssistantModelSettings
