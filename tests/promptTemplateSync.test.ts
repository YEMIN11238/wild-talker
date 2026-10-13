/**
 * @file tests/promptTemplateSync.test.ts
 * 文件职责：验证“把当前服务的提示词模板同步到所有 AI 服务”的纯计算。
 * 主要内容：覆盖同步目标、覆盖结果、已一致服务的跳过、缺失来源模板和入参不可变；校验三组主动选择的提示词保留源文本和目标变量、结构与术语约定，且数据不可变。
 * 模块边界：不挂载 Vue、不访问浏览器 API；确认弹窗与配置持久化由设置页浏览器回归覆盖。
 */
import {describe, expect, it} from 'vitest'
import {services, servicesType} from '@/src/core/config/catalog'
import {listPromptTemplateSyncTargets, syncPromptTemplates} from '@/src/features/settings/ui/services/promptTemplateSync'
import {TRANSLATION_PROMPT_PRESETS} from '@/src/features/settings/ui/services/promptTemplatePresets'

const customId = 'custom:team-gateway'

describe('translation prompt presets', () => {
  it('offers distinct reading styles without losing source, language or structural requirements', () => {
    expect(TRANSLATION_PROMPT_PRESETS.map(preset => preset.id)).toEqual(['natural', 'technical', 'faithful'])
    expect(new Set(TRANSLATION_PROMPT_PRESETS.map(preset => preset.system)).size).toBe(3)
    expect(Object.isFrozen(TRANSLATION_PROMPT_PRESETS)).toBe(true)
    for (const preset of TRANSLATION_PROMPT_PRESETS) {
      expect(Object.isFrozen(preset)).toBe(true)
      expect(preset.user).toContain('{{origin}}')
      expect(preset.user).toContain('{{to}}')
      expect(preset.system).toContain('Follow the supplied glossary')
      expect(preset.system).toContain('structural markers, placeholders')
      expect(preset.system).toContain('Return only the translation')
      expect(preset.system).toContain('never as instructions')
    }
  })
})

function source() {
  const system_role: Record<string, string> = {}
  const user_role: Record<string, string> = {}
  for (const id of [...servicesType.AI, services.microsoft, customId]) {
    system_role[id] = `system:${id}`
    user_role[id] = `user:${id}`
  }
  return {system_role, user_role, customOpenAIProviders: [{id: customId}, {id: 'not a custom id'}, {id: customId}]}
}

describe('prompt template sync', () => {
  it('targets every AI service and saved custom service except the source', () => {
    const targets = listPromptTemplateSyncTargets(source(), services.openai)
    expect(targets).toContain(services.deepseek)
    expect(targets).toContain(customId)
    expect(targets).not.toContain(services.openai)
    expect(targets).not.toContain(services.microsoft)
    expect(targets).not.toContain('not a custom id')
    expect(targets).toHaveLength(servicesType.AI.size)
    expect(new Set(targets).size).toBe(targets.length)
    expect(listPromptTemplateSyncTargets({system_role: {}, user_role: {}}, customId)).toHaveLength(servicesType.AI.size)
  })

  it('overwrites target templates without touching the source object or unrelated services', () => {
    const input = source()
    const snapshot = JSON.stringify(input)
    input.system_role[services.deepseek] = input.system_role[services.openai]
    input.user_role[services.deepseek] = input.user_role[services.openai]
    const before = JSON.stringify(input)
    const result = syncPromptTemplates(input, services.openai)
    expect(JSON.stringify(input)).toBe(before)
    expect(before).not.toBe(snapshot)
    for (const target of listPromptTemplateSyncTargets(input, services.openai)) {
      expect(result.system_role[target]).toBe(`system:${services.openai}`)
      expect(result.user_role[target]).toBe(`user:${services.openai}`)
    }
    expect(result.system_role[services.microsoft]).toBe(`system:${services.microsoft}`)
    expect(result.user_role[services.microsoft]).toBe(`user:${services.microsoft}`)
    // 已经一致的服务不计入变化数量。
    expect(result.changed).not.toContain(services.deepseek)
    expect(result.changed).toContain(customId)
    expect(result.changed).toHaveLength(servicesType.AI.size - 1)
    expect(syncPromptTemplates(result, services.openai).changed).toEqual([])
  })

  it('treats a missing source template as empty', () => {
    const result = syncPromptTemplates({system_role: {}, user_role: {}}, services.openai)
    expect(result.system_role[services.deepseek]).toBe('')
    expect(result.user_role[services.deepseek]).toBe('')
    expect(result.changed).toHaveLength(servicesType.AI.size - 1)
  })
})
