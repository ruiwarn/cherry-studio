import { PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import ImageSize1_1 from '@renderer/assets/images/paintings/image-size-1-1.svg'
import ImageSize1_2 from '@renderer/assets/images/paintings/image-size-1-2.svg'
import ImageSize3_2 from '@renderer/assets/images/paintings/image-size-3-2.svg'
import ImageSize3_4 from '@renderer/assets/images/paintings/image-size-3-4.svg'
import ImageSize9_16 from '@renderer/assets/images/paintings/image-size-9-16.svg'
import ImageSize16_9 from '@renderer/assets/images/paintings/image-size-16-9.svg'
import { Navbar, NavbarCenter, NavbarRight } from '@renderer/components/app/Navbar'
import { VStack } from '@renderer/components/Layout'
import Scrollbar from '@renderer/components/Scrollbar'
import TranslateButton from '@renderer/components/TranslateButton'
import { TEXT_TO_IMAGES_MODELS } from '@renderer/config/models'
import { useTheme } from '@renderer/context/ThemeProvider'
import { usePaintings } from '@renderer/hooks/usePaintings'
import { useAllProviders } from '@renderer/hooks/useProvider'
import AiProvider from '@renderer/providers/AiProvider'
import { getProviderByModel } from '@renderer/services/AssistantService'
import FileManager from '@renderer/services/FileManager'
import { DEFAULT_PAINTING } from '@renderer/store/paintings'
import { FileType, Painting } from '@renderer/types'
import { getErrorMessage } from '@renderer/utils'
import { Button, Input, InputNumber, Radio, Select, Slider, Spin, Tooltip } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import SendMessageButton from '../home/Inputbar/SendMessageButton'
import ImagePreview from '../home/Markdown/ImagePreview'
import { SettingTitle } from '../settings'
import PaintingsList from './PaintingsList'

const IMAGE_SIZES = [
  {
    label: '1:1',
    value: '1024x1024',
    icon: ImageSize1_1
  },
  {
    label: '1:2',
    value: '512x1024',
    icon: ImageSize1_2
  },
  {
    label: '3:2',
    value: '768x512',
    icon: ImageSize3_2
  },
  {
    label: '3:4',
    value: '768x1024',
    icon: ImageSize3_4
  },
  {
    label: '16:9',
    value: '1024x576',
    icon: ImageSize16_9
  },
  {
    label: '9:16',
    value: '576x1024',
    icon: ImageSize9_16
  }
]

let _painting: Painting

const PaintingsPage: FC = () => {
  const { t } = useTranslation()
  const { paintings, addPainting, removePainting, updatePainting } = usePaintings()
  const [painting, setPainting] = useState<Painting>(_painting || paintings[0])
  const { theme } = useTheme()
  const providers = useAllProviders()
  const siliconProvider = providers.find((p) => p.id === 'silicon')!
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const modelOptions = TEXT_TO_IMAGES_MODELS.map((model) => ({
    label: model.name,
    value: model.id
  }))

  const textareaRef = useRef<any>(null)
  _painting = painting

  const updatePaintingState = (updates: Partial<Painting>) => {
    const updatedPainting = { ...painting, ...updates }
    setPainting(updatedPainting)
    updatePainting(updatedPainting)
  }

  const onSelectModel = (modelId: string) => {
    const model = TEXT_TO_IMAGES_MODELS.find((m) => m.id === modelId)
    if (model) {
      updatePaintingState({ model: modelId })
    }
  }

  const onGenerate = async () => {
    if (painting.files.length > 0) {
      const confirmed = await window.modal.confirm({
        content: t('images.regenerate.confirm'),
        centered: true
      })

      if (!confirmed) {
        return
      }

      await FileManager.deleteFiles(painting.files)
    }

    const prompt = textareaRef.current?.resizableTextArea?.textArea?.value || ''

    updatePaintingState({ prompt })

    const model = TEXT_TO_IMAGES_MODELS.find((m) => m.id === painting.model)
    const provider = getProviderByModel(model)

    if (!provider.enabled) {
      window.modal.error({
        content: t('error.provider_disabled'),
        centered: true
      })
      return
    }

    if (!provider.apiKey) {
      window.modal.error({
        content: t('error.no_api_key'),
        centered: true
      })
      return
    }

    const controller = new AbortController()
    setAbortController(controller)
    setIsLoading(true)
    const AI = new AiProvider(provider)

    try {
      const urls = await AI.generateImage({
        prompt,
        negativePrompt: painting.negativePrompt || '',
        imageSize: painting.imageSize || '1024x1024',
        batchSize: painting.numImages || 1,
        seed: painting.seed || undefined,
        numInferenceSteps: painting.steps || 25,
        guidanceScale: painting.guidanceScale || 4.5,
        signal: controller.signal
      })

      if (urls.length > 0) {
        const downloadedFiles = await Promise.all(
          urls.map(async (url) => {
            try {
              return await window.api.file.download(url)
            } catch (error) {
              console.error('Failed to download image:', error)
              return null
            }
          })
        )

        const validFiles = downloadedFiles.filter((file): file is FileType => file !== null)

        await FileManager.addFiles(validFiles)

        updatePaintingState({ files: validFiles })
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        window.modal.error({
          content: getErrorMessage(error),
          centered: true
        })
      }
    } finally {
      setIsLoading(false)
      setAbortController(null)
    }
  }

  const onCancel = () => {
    abortController?.abort()
  }

  const onSelectImageSize = (v: string) => {
    const size = IMAGE_SIZES.find((i) => i.value === v)
    size && updatePaintingState({ imageSize: size.value })
  }

  const getCurrentImageUrl = () => {
    const currentFile = painting.files[currentImageIndex]
    return currentFile ? FileManager.getFileUrl(currentFile) : ''
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % painting.files.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + painting.files.length) % painting.files.length)
  }

  const onDeletePainting = (paintingToDelete: Painting) => {
    if (paintingToDelete.id === painting.id) {
      const currentIndex = paintings.findIndex((p) => p.id === paintingToDelete.id)

      if (currentIndex > 0) {
        setPainting(paintings[currentIndex - 1])
      } else if (paintings.length > 1) {
        setPainting(paintings[1])
      }
    }

    removePainting(paintingToDelete)

    if (paintings.length === 1) {
      setPainting(DEFAULT_PAINTING)
    }
  }

  const onSelectPainting = (newPainting: Painting) => {
    setPainting(newPainting)
    setCurrentImageIndex(0)
  }

  return (
    <Container>
      <Navbar>
        <NavbarCenter style={{ borderRight: 'none' }}>{t('images.title')}</NavbarCenter>
        <NavbarRight style={{ justifyContent: 'flex-end' }}>
          <Button size="small" className="nodrag" icon={<PlusOutlined />} onClick={() => setPainting(addPainting())}>
            {t('images.button.new.image')}
          </Button>
        </NavbarRight>
      </Navbar>
      <ContentContainer id="content-container">
        <LeftContainer>
          <SettingTitle style={{ marginBottom: 5 }}>{t('common.provider')}</SettingTitle>
          <Select
            value={siliconProvider.id}
            disabled={true}
            options={[{ label: siliconProvider.name, value: siliconProvider.id }]}
          />
          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>{t('common.model')}</SettingTitle>
          <Select value={painting.model} options={modelOptions} onChange={onSelectModel} />
          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>{t('images.image.size')}</SettingTitle>
          <Radio.Group
            value={painting.imageSize}
            onChange={(e) => onSelectImageSize(e.target.value)}
            style={{ display: 'flex' }}>
            {IMAGE_SIZES.map((size) => (
              <RadioButton value={size.value} key={size.value}>
                <VStack alignItems="center">
                  <ImageSizeImage src={size.icon} theme={theme} />
                  <span>{size.label}</span>
                </VStack>
              </RadioButton>
            ))}
          </Radio.Group>

          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>
            {t('images.number_images')}
            <Tooltip title={t('images.number_images_tip')}>
              <InfoIcon />
            </Tooltip>
          </SettingTitle>
          <InputNumber
            min={1}
            max={4}
            value={painting.numImages}
            onChange={(v) => updatePaintingState({ numImages: v || 1 })}
          />

          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>
            {t('images.seed')}
            <Tooltip title={t('images.seed_tip')}>
              <InfoIcon />
            </Tooltip>
          </SettingTitle>
          <Input
            value={painting.seed}
            onChange={(e) => updatePaintingState({ seed: e.target.value })}
            suffix={<RefreshIcon onClick={() => updatePaintingState({ seed: '' })} />}
          />

          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>
            {t('images.inference_steps')}
            <Tooltip title={t('images.inference_steps_tip')}>
              <InfoIcon />
            </Tooltip>
          </SettingTitle>
          <Slider min={1} max={50} value={painting.steps} onChange={(v) => updatePaintingState({ steps: v })} />
          <InputNumber
            min={1}
            max={50}
            value={painting.steps}
            onChange={(v) => updatePaintingState({ steps: v || 25 })}
          />

          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>
            {t('images.guidance_scale')}
            <Tooltip title={t('images.guidance_scale_tip')}>
              <InfoIcon />
            </Tooltip>
          </SettingTitle>
          <Slider
            min={1}
            max={20}
            step={0.1}
            value={painting.guidanceScale}
            onChange={(v) => updatePaintingState({ guidanceScale: v })}
          />
          <InputNumber
            min={1}
            max={20}
            step={0.1}
            value={painting.guidanceScale}
            onChange={(v) => updatePaintingState({ guidanceScale: v || 4.5 })}
          />

          <SettingTitle style={{ marginBottom: 5, marginTop: 15 }}>
            {t('images.negative_prompt')}
            <Tooltip title={t('images.negative_prompt_tip')}>
              <InfoIcon />
            </Tooltip>
          </SettingTitle>
          <TextArea
            value={painting.negativePrompt}
            onChange={(e) => updatePaintingState({ negativePrompt: e.target.value })}
            rows={4}
          />
        </LeftContainer>
        <MainContainer>
          <Artboard>
            <LoadingContainer spinning={isLoading}>
              {painting.files.length > 0 ? (
                <ImageContainer>
                  {painting.files.length > 1 && (
                    <NavigationButton onClick={prevImage} style={{ left: 10 }}>
                      ←
                    </NavigationButton>
                  )}
                  <ImagePreview
                    src={getCurrentImageUrl()}
                    preview={{ mask: false }}
                    style={{
                      width: '70vh',
                      height: '70vh',
                      objectFit: 'contain',
                      backgroundColor: 'var(--color-background-soft)',
                      cursor: 'pointer'
                    }}
                  />
                  {painting.files.length > 1 && (
                    <NavigationButton onClick={nextImage} style={{ right: 10 }}>
                      →
                    </NavigationButton>
                  )}
                  <ImageCounter>
                    {currentImageIndex + 1} / {painting.files.length}
                  </ImageCounter>
                </ImageContainer>
              ) : (
                <ImagePlaceholder />
              )}
              {isLoading && (
                <LoadingOverlay>
                  <Spin size="large" />
                  <CancelButton onClick={onCancel}>{t('common.cancel')}</CancelButton>
                </LoadingOverlay>
              )}
            </LoadingContainer>
          </Artboard>
          <InputContainer>
            <Textarea
              ref={textareaRef}
              variant="borderless"
              disabled={isLoading}
              value={painting.prompt}
              onChange={(e) => updatePaintingState({ prompt: e.target.value })}
              placeholder={t('images.prompt_placeholder')}
            />
            <Toolbar>
              <ToolbarMenu>
                <TranslateButton
                  text={textareaRef.current?.resizableTextArea?.textArea?.value}
                  onTranslated={(translatedText) => updatePaintingState({ prompt: translatedText })}
                  disabled={isLoading}
                  style={{ marginRight: 6 }}
                />
                <SendMessageButton sendMessage={onGenerate} disabled={isLoading} />
              </ToolbarMenu>
            </Toolbar>
          </InputContainer>
        </MainContainer>
        <PaintingsList
          paintings={paintings}
          selectedPainting={painting}
          onSelectPainting={onSelectPainting}
          onDeletePainting={onDeletePainting}
        />
      </ContentContainer>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
`

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  height: 100%;
  background-color: var(--color-background);
  overflow: hidden;
`

const LeftContainer = styled(Scrollbar)`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  background-color: var(--color-background);
  max-width: var(--assistants-width);
  border-right: 0.5px solid var(--color-border);
`

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-background);
`

const Artboard = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: center;
  align-items: center;
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100px;
  max-height: 100px;
  position: relative;
  border: 1px solid var(--color-border-soft);
  transition: all 0.3s ease;
  margin: 0 20px 15px 20px;
  border-radius: 10px;
`

const Textarea = styled(TextArea)`
  padding: 10px;
  border-radius: 0;
  display: flex;
  flex: 1;
  font-family: Ubuntu;
  resize: none !important;
  overflow: auto;
  width: auto;
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-content: flex-end;
  padding: 0 8px;
  padding-bottom: 0;
  height: 36px;
`

const ToolbarMenu = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 6px;
`

const ImagePlaceholder = styled.div`
  display: flex;
  width: 70vh;
  height: 70vh;
  background-color: var(--color-background-soft);
  align-items: center;
  justify-content: center;
  cursor: pointer;
`

const ImageSizeImage = styled.img<{ theme: string }>`
  filter: ${({ theme }) => (theme === 'dark' ? 'invert(100%)' : 'none')};
  margin-top: 8px;
`

const RadioButton = styled(Radio.Button)`
  width: 30px;
  height: 55px;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: center;
`

const InfoIcon = styled(QuestionCircleOutlined)`
  margin-left: 5px;
  cursor: help;
  color: var(--color-text-2);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`

const RefreshIcon = styled.span`
  cursor: pointer;
`

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;

  .ant-spin {
    max-height: none;
  }

  .ant-spin-spinning {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }
`

const NavigationButton = styled(Button)`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`

const ImageCounter = styled.div`
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
`

const LoadingContainer = styled.div<{ spinning: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${(props) => (props.spinning ? 0.5 : 1)};
  transition: opacity 0.3s;
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`

const CancelButton = styled(Button)`
  margin-top: 10px;
  z-index: 1001;
`

export default PaintingsPage
