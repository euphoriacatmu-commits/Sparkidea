// ============================================================
// 全局 TypeScript 类型定义
// ============================================================

// ——————————————————————————————————————
// 项目参数
// ——————————————————————————————————————

export type Genre =
  | 'romance'      // 甜宠
  | 'comedy'       // 喜剧
  | 'suspense'     // 悬疑
  | 'revenge'      // 复仇爽剧
  | 'darkRevenge'  // 暗黑复仇
  | 'cyberpunk'    // 赛博朋克
  | 'ancient'      // 古风宫斗
  | 'urbanFantasy' // 都市异能
  | 'rebirth'      // 穿越重生
  | 'apocalypse'   // 末世求生
  | 'system'       // 系统觉醒

export type PaceStyle = 'ultra' | 'fast' | 'slow_burn'

export type DialogueDensity = 'extreme' | 'high' | 'balanced' | 'narrative'

export type Platform =
  | 'hongguo'
  | 'douyin'
  | 'xiaoyunque'
  | 'oiioii'
  | 'tapnow'
  | 'liblib'
  | 'universal'

export type Audience = 'f18-24' | 'f25-35' | 'm18-30' | 'all-age'

export interface ProjectConfig {
  title: string
  totalEpisodes: number
  episodeDuration: number   // 支持小数，如 1.5 表示 1.5 分钟（90秒）
  aspectRatio: '16:9' | '9:16'
  genres: Genre[]
  paceStyle: PaceStyle
  targetAudience: Audience[]
  memeIntensity: 1 | 2 | 3 | 4 | 5
  dialogueDensity: DialogueDensity
  platform: Platform
  visualStylePrompt?: string
}

// ——————————————————————————————————————
// 选题卡片
// ——————————————————————————————————————

export interface IdeationCard {
  id: string
  title: string
  logline: string
  coreEmotion: 'love' | 'hate' | 'fear' | 'resentment'
  trafficBase: string
  hook: string
  eraEmotion: string
  potential: 'high' | 'medium'
  potentialReason: string
}

// ——————————————————————————————————————
// 角色
// ——————————————————————————————————————

export interface Character {
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting'
  archetype: string
  flaw: string
  arc: string
  signatureLine: string
}

// ——————————————————————————————————————
// 全集规划
// ——————————————————————————————————————

export type HookType =
  | 'emotion_unresolved'
  | 'info_bomb'
  | 'identity_question'
  | 'cp_tension'
  | 'moral_dilemma'
  | 'cliffhanger'

export type NodeType =
  | 'normal'
  | 'plot_bomb'
  | 'major_twist'
  | 'emotional_peak'
  | 'comedy_peak'

export interface Act {
  name: string
  episodeRange: [number, number]
  emotionTarget: string
}

export interface PlotBomb {
  episodeNumber: number
  type: 'identity_reveal' | 'betrayal' | 'twist' | 'emotional_peak'
  description: string
}

export interface EpisodeOutline {
  episodeNumber: number
  title: string
  synopsis: string
  hookType: HookType
  emotionTarget: string
  nodeType: NodeType
  emotionPeak?: number
}

export interface SeriesPlan {
  projectId: string
  acts: Act[]
  characters: Character[]
  plotBombs: PlotBomb[]
  hotEpisodes: number[]
  episodes: EpisodeOutline[]
}

// ——————————————————————————————————————
// 单集剧本
// ——————————————————————————————————————

export interface EpisodePreInfo {
  lastEmotionState: string
  emotionDebt: string
  targetReaction: string
}

export interface Beat {
  timeRange: string
  function: string
  content: string
}

export interface EditorNotes {
  cluesPlanted: string[]
  nextEmotionDebt: string
  screenshotMoments: string[]
  predictedDanmu: string[]
}

export interface EpisodeMetadata {
  twistCount: number
  dialogueRatio: number
  hookType: HookType
  estimatedDuration: number
}

export interface Episode {
  episodeNumber: number
  title: string
  preInfo: EpisodePreInfo
  beats: Beat[]
  script: string
  editorNotes: EditorNotes
  metadata: EpisodeMetadata
}

// ——————————————————————————————————————
// 大纲解析
// ——————————————————————————————————————

export interface ParsedOutline {
  title: string
  synopsis: string
  mainCharacters: Character[]
  emotionCore: string
  existingPlotPoints: string[]
  suggestedGenre: Genre[]
  confidence: 'high' | 'medium' | 'low'
}

// ——————————————————————————————————————
// 质量检测
// ——————————————————————————————————————

export type QualityRuleId =
  | 'no_twist'
  | 'hook_repeat'
  | 'emotion_flat'
  | 'character_ooc'
  | 'low_dialogue'

export interface QualityWarning {
  type: QualityRuleId
  severity: 'warn' | 'error'
  message: string
  suggestion: string
}

// ——————————————————————————————————————
// 导出选项
// ——————————————————————————————————————

export interface ExportOptions {
  format: 'txt' | 'docx' | 'json'
  scope: 'single' | 'range' | 'all'
  includeEditorNotes: boolean
  includeVisualPrompts: boolean
  platformFormat: Platform
}

// ——————————————————————————————————————
// 已保存的项目
// ——————————————————————————————————————

export interface SavedProject {
  id: string
  savedAt: string
  config: ProjectConfig
  selectedIdeation: IdeationCard
  seriesPlan: SeriesPlan
  episodes: Episode[]
}
