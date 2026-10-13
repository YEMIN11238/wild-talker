<!--
 * @file src/features/settings/ui/services/CustomOpenAIProviderDialog.vue
 * 文件职责：收集新建 OpenAI-compatible 翻译服务所需的最小配置，并在确认时一次性提交。
 * 主要内容：使用局部草稿编辑名称、接口地址、可选 API Key 和首个模型，提供长度、地址格式与必填校验。
 * 模块边界：组件不直接修改 Config、凭据仓库或默认服务；调用方负责生成稳定 ID、写入配置和选择新服务。
 -->
<template>
  <el-dialog
    :model-value="modelValue && active && ownedOpen"
    width="min(520px, calc(100vw - 28px))"
    class="custom-openai-provider-dialog"
    data-testid="custom-service-dialog"
    title="添加 OpenAI 兼容服务"
    :close-on-click-modal="false"
    destroy-on-close
    :onOpened="actions.focus"
    :onUpdate:modelValue="actions.update"
  >
    <form class="custom-provider-form" novalidate :onSubmit="withModifiers(actions.submit, ['prevent'])">
      <label>
        <span>服务名称</span>
        <input
          ref="nameInput"
          :value="draft.name"
          :onInput="actions.draft.bind(null, 'name')"
          type="text"
          autocomplete="off"
          data-testid="custom-service-name"
          placeholder="例如：本地 Ollama"
          :maxlength="maximumNameLength"
          :aria-invalid="Boolean(errors.name)"
        />
        <small v-if="errors.name" class="field-error" role="alert">{{ errors.name }}</small>
      </label>

      <label>
        <span>接口地址</span>
        <input
          :value="draft.endpoint"
          :onInput="actions.draft.bind(null, 'endpoint')"
          type="url"
          autocomplete="url"
          data-testid="custom-service-endpoint"
          placeholder="http://localhost:11434/v1/chat/completions"
          :maxlength="maximumEndpointLength"
          :aria-invalid="Boolean(errors.endpoint)"
        />
        <small>支持完整 Chat Completions 地址或以 /v1 结尾的 Base URL；模型须支持 Chat Completions</small>
        <small v-if="errors.endpoint" class="field-error" role="alert">{{ errors.endpoint }}</small>
      </label>

      <label>
        <span>API Key <small>可选</small></span>
        <input
          :value="draft.apiKey"
          :onInput="actions.draft.bind(null, 'apiKey')"
          type="password"
          autocomplete="new-password"
          data-testid="custom-service-api-key"
          placeholder="留空表示暂不配置"
        />
      </label>

      <label>
        <span>首个模型</span>
        <input
          :value="draft.model"
          :onInput="actions.draft.bind(null, 'model')"
          type="text"
          autocomplete="off"
          spellcheck="false"
          data-testid="custom-service-model"
          placeholder="例如：gpt-4.1-mini"
          :maxlength="maximumModelLength"
          :aria-invalid="Boolean(errors.model)"
          :onKeydown="withKeys(withModifiers(actions.close, ['stop']), ['esc'])"
        />
        <small v-if="errors.model" class="field-error" role="alert">{{ errors.model }}</small>
      </label>

      <footer>
        <button type="button" class="secondary-button" :onClick="actions.close">取消</button>
        <button type="submit" class="primary-button" data-testid="custom-service-save">保存服务</button>
      </footer>
    </form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, withKeys, withModifiers } from 'vue'
import {useSettingsActionContext} from '../../model/useSettingsActionContext'
import {
  CUSTOM_OPENAI_RESERVED_MODEL_ID,
  MAX_CUSTOM_OPENAI_MODEL_LENGTH,
  MAX_CUSTOM_OPENAI_PROVIDER_ENDPOINT_LENGTH,
  MAX_CUSTOM_OPENAI_PROVIDER_NAME_LENGTH,
} from '@/src/core/config/customOpenAI'

interface CustomOpenAIProviderDraft {
  name: string
  endpoint: string
  apiKey: string
  model: string
}

const props = withDefaults(defineProps<{
  modelValue: boolean
  active?: boolean
  context?: unknown
  maximumNameLength?: number
  maximumEndpointLength?: number
  maximumModelLength?: number
}>(), {
  active: true,
  maximumNameLength: MAX_CUSTOM_OPENAI_PROVIDER_NAME_LENGTH,
  maximumEndpointLength: MAX_CUSTOM_OPENAI_PROVIDER_ENDPOINT_LENGTH,
  maximumModelLength: MAX_CUSTOM_OPENAI_MODEL_LENGTH,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [draft: CustomOpenAIProviderDraft]
}>()

const nameInput = ref<HTMLInputElement | null>(null)
const draft = reactive<CustomOpenAIProviderDraft>({name: '', endpoint: '', apiKey: '', model: ''})
const ownedOpen = ref(props.modelValue)
const {active, capture} = useSettingsActionContext(() => props.active !== false, () => [props.context, props.modelValue])
const actions = computed(() => {
  const current = capture()
  return {close: () => {if (current()) closeDialog()},
    draft: (field: keyof CustomOpenAIProviderDraft, event: Event) => {
      if (!current() || !ownedOpen.value || !(event.target instanceof HTMLInputElement)) return
      draft[field] = event.target.value
      if (field !== 'apiKey') errors[field] = ''
    }, focus: () => {if (current()) focusFirstField()}, submit: () => {if (current()) submitProvider()},
    update: (open: boolean) => {if (current()) updateOpenState(open)}}
})
const errors = reactive({name: '', endpoint: '', model: ''})

function resetDraft(): void {
  draft.name = ''
  draft.endpoint = ''
  draft.apiKey = ''
  draft.model = ''
  errors.name = ''
  errors.endpoint = ''
  errors.model = ''
}

function focusFirstField(): void {
  if (active.value && ownedOpen.value && props.modelValue) nameInput.value?.focus()
}

function updateOpenState(value: boolean): void {
  if (!active.value || !ownedOpen.value) return
  if (!value) closeDialog()
}

function closeDialog(): void {
  const wasOpen = ownedOpen.value
  ownedOpen.value = false
  resetDraft()
  if (wasOpen) emit('update:modelValue', false)
}

function isValidEndpoint(value: string): boolean {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function submitProvider(): void {
  if (!active.value || !ownedOpen.value || !props.modelValue) return
  const value: CustomOpenAIProviderDraft = {
    name: draft.name.trim(),
    endpoint: draft.endpoint.trim(),
    apiKey: draft.apiKey.trim(),
    model: draft.model.trim(),
  }
  errors.name = !value.name ? '请输入服务名称' : value.name.length > props.maximumNameLength ? `服务名称最多 ${props.maximumNameLength} 个字符` : ''
  errors.endpoint = !value.endpoint ? '请输入接口地址' : value.endpoint.length > props.maximumEndpointLength ? `接口地址最多 ${props.maximumEndpointLength} 个字符` : isValidEndpoint(value.endpoint) ? '' : '请输入有效的 HTTP 或 HTTPS 地址'
  errors.model = !value.model
    ? '请输入至少一个模型'
    : value.model.length > props.maximumModelLength
      ? `模型标识最多 ${props.maximumModelLength} 个字符`
      : value.model === CUSTOM_OPENAI_RESERVED_MODEL_ID
      ? `“${CUSTOM_OPENAI_RESERVED_MODEL_ID}”是界面保留名称，请换一个模型标识`
      : ''
  if (errors.name || errors.endpoint || errors.model) return
  closeDialog()
  emit('submit', value)
}

watch(() => props.modelValue, (open) => {
  resetDraft()
  ownedOpen.value = open && active.value
}, {flush: 'sync'})
watch(() => [active.value, props.context], () => {closeDialog()}, {flush: 'sync'})
</script>

<style scoped>
.custom-provider-form { display: grid; gap: 15px; }
.custom-provider-form > label { display: grid; gap: 6px; color: var(--ink, #252a24); }
.custom-provider-form > label > span { font-size: 12px; font-weight: 750; }
.custom-provider-form > label > span small, .custom-provider-form > label > small { color: var(--muted, #6f7869); font-size: 10px; font-weight: 400; }
.custom-provider-form input {
  width: 100%; min-height: 42px; padding: 0 12px; border: 1px solid var(--line, #dce3d2); border-radius: 11px; color: var(--ink, #252a24); background: var(--surface-soft, #f5f7f0); outline: none; font-size: 13px;
}
.custom-provider-form input:focus { border-color: var(--brand, #648433); background: var(--surface, #fff); box-shadow: 0 0 0 2px var(--brand-soft, #edf5dd); }
.custom-provider-form input[aria-invalid='true'] { border-color: #d9345e; }
.custom-provider-form .field-error { color: #c52f58; }
.custom-provider-form footer { display: flex; justify-content: flex-end; gap: 9px; margin-top: 5px; }
.custom-provider-form footer button { min-height: 38px; padding: 0 15px; border-radius: 10px; font-size: 12px; font-weight: 750; cursor: pointer; }
.secondary-button { border: 1px solid var(--line, #dce3d2); color: var(--ink, #252a24); background: var(--surface, #fff); }
.primary-button { border: 1px solid var(--brand, #648433); color: var(--brand-strong, #456021); background: var(--brand-soft, #edf5dd); }
.primary-button:hover:not(:disabled) { background: color-mix(in srgb, var(--brand, #648433) 14%, var(--surface, #fff)); }
.custom-provider-form footer button:focus-visible { outline: 2px solid var(--brand, #648433); outline-offset: 2px; }
:global(:root.dark .custom-provider-form > label) { color: var(--ink); }
:global(:root.dark .custom-provider-form input),
:global(:root.dark .secondary-button) { border-color: var(--line); color: var(--ink); background: var(--surface-soft); }
</style>
