import { TopView } from '@renderer/components/TopView'
import { useProvider } from '@renderer/hooks/useProvider'
import { Model, Provider } from '@renderer/types'
import { getDefaultGroupName } from '@renderer/utils'
import { Button, Form, FormProps, Input, Modal } from 'antd'
import { find } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ShowParams {
  title: string
  provider: Provider
}

interface Props extends ShowParams {
  resolve: (data: any) => void
}

type FieldType = {
  provider: string
  id: string
  name?: string
  group?: string
}

const PopupContainer: React.FC<Props> = ({ title, provider, resolve }) => {
  const [open, setOpen] = useState(true)
  const [form] = Form.useForm()
  const { addModel, models } = useProvider(provider.id)
  const { t } = useTranslation()

  const onOk = () => {
    setOpen(false)
  }

  const onCancel = () => {
    setOpen(false)
  }

  const onClose = () => {
    resolve({})
  }

  const onFinish: FormProps<FieldType>['onFinish'] = (values) => {
    if (find(models, { id: values.id })) {
      Modal.error({ title: 'Error', content: 'Model ID already exists' })
      return
    }

    const model: Model = {
      provider: provider.id,
      id: values.id,
      name: values.name ? values.name : values.id.toUpperCase(),
      group: getDefaultGroupName(values.group || values.id)
    }

    addModel(model)

    resolve(model)
  }

  return (
    <Modal
      title={title}
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      maskClosable={false}
      afterClose={onClose}
      footer={null}>
      <Form
        form={form}
        labelCol={{ flex: '110px' }}
        labelAlign="left"
        colon={false}
        style={{ marginTop: 25 }}
        onFinish={onFinish}>
        <Form.Item
          name="id"
          label={t('settings.models.add.model_id')}
          tooltip={t('settings.models.add.model_id.tooltip')}
          rules={[{ required: true }]}>
          <Input
            placeholder={t('settings.models.add.model_id.placeholder')}
            spellCheck={false}
            maxLength={50}
            onChange={(e) => {
              form.setFieldValue('name', e.target.value.toUpperCase())
              form.setFieldValue('group', getDefaultGroupName(e.target.value))
            }}
          />
        </Form.Item>
        <Form.Item
          name="name"
          label={t('settings.models.add.model_name')}
          tooltip={t('settings.models.add.model_name.placeholder')}>
          <Input placeholder={t('settings.models.add.model_name.placeholder')} spellCheck={false} />
        </Form.Item>
        <Form.Item
          name="group"
          label={t('settings.models.add.group_name')}
          tooltip={t('settings.models.add.group_name.tooltip')}>
          <Input placeholder={t('settings.models.add.group_name.placeholder')} spellCheck={false} />
        </Form.Item>
        <Form.Item label=" ">
          <Button type="primary" htmlType="submit">
            {t('settings.models.add.add_model')}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default class AddModelPopup {
  static topviewId = 0
  static hide() {
    TopView.hide(this.topviewId)
  }
  static show(props: ShowParams) {
    return new Promise<any>((resolve) => {
      this.topviewId = TopView.show(
        <PopupContainer
          {...props}
          resolve={(v) => {
            resolve(v)
            this.hide()
          }}
        />
      )
    })
  }
}
