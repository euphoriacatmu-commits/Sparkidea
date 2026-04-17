import type { Platform } from './types'

export interface PlatformSpec {
  name: string
  spec: string
  dialogueNote: string
  sceneNote: string
  visualHint: string
  defaultEpisodeDuration: number
  defaultTotalEpisodes: number
}

export const PLATFORM_SPECS: Record<Platform, PlatformSpec> = {
  hongguo: {
    name: '红果漫剧',
    spec: '单集≤3分钟，首帧必须有视觉冲击，强钩子优先',
    dialogueNote: '对话简短有力，字幕友好，单句≤15字为佳',
    sceneNote: '场景切换频率高，每30秒至少换一个情绪节点',
    visualHint: '竖屏构图，人物居中，表情特写多',
    defaultEpisodeDuration: 3,
    defaultTotalEpisodes: 80,
  },
  douyin: {
    name: '抖音短剧',
    spec: '单集30秒-3分钟，前3秒决定生死，完播率优先',
    dialogueNote: '台词即字幕，超短句，观众不看画面只看字也能懂剧情',
    sceneNote: '低切换成本，室内场景为主，降低制作门槛',
    visualHint: '近景/特写为主，表情变化是叙事核心',
    defaultEpisodeDuration: 2,
    defaultTotalEpisodes: 60,
  },
  xiaoyunque: {
    name: '小云雀',
    spec: 'AI漫剧制作平台，输出需含角色一致性描述和场景分镜提示词',
    dialogueNote: '台词需标注情绪标签，便于AI生成配音',
    sceneNote: '每个场景配AI绘图提示词（英文/中文均可）',
    visualHint: '角色描述需包含外貌特征关键词，保持集间一致性',
    defaultEpisodeDuration: 4,
    defaultTotalEpisodes: 40,
  },
  oiioii: {
    name: 'oiioii',
    spec: 'AI漫剧制作平台，分镜级提示词，场景需细化到镜头角度',
    dialogueNote: '对白字数控制在画面时长内',
    sceneNote: '场景描述需指定镜头类型：全景/中景/特写/俯拍/仰拍',
    visualHint: '输出分镜脚本格式，每个镜头单独成行',
    defaultEpisodeDuration: 4,
    defaultTotalEpisodes: 50,
  },
  tapnow: {
    name: 'TapNow',
    spec: 'AI漫剧制作平台，注重风格一致性，输出需含画风维持关键词',
    dialogueNote: '台词需标注语气和停顿',
    sceneNote: '场景情绪色调标注（暖/冷/高对比度等）',
    visualHint: '输出含画风关键词和情绪色调',
    defaultEpisodeDuration: 5,
    defaultTotalEpisodes: 30,
  },
  liblib: {
    name: 'LibLib',
    spec: 'AI生图平台，提示词需符合Stable Diffusion格式',
    dialogueNote: '台词标注角色情绪用于生图参考',
    sceneNote: '场景描述直接输出 SD 正向提示词和反向提示词',
    visualHint: '每场景输出：正向提示词（英文）+ 反向提示词 + 参考比例',
    defaultEpisodeDuration: 4,
    defaultTotalEpisodes: 40,
  },
  universal: {
    name: '通用格式',
    spec: '标准影视剧本格式，适配多平台',
    dialogueNote: '标准格式即可',
    sceneNote: '场景/人物/对白标准格式',
    visualHint: '无特殊视觉要求',
    defaultEpisodeDuration: 5,
    defaultTotalEpisodes: 30,
  },
}

export function getPlatformSpec(platform: Platform): PlatformSpec {
  return PLATFORM_SPECS[platform]
}
