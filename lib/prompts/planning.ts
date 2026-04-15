import type { ProjectConfig, IdeationCard } from '../types'
import { PLATFORM_SPECS } from '../platform-presets'

function getWordsPerMinute(density: ProjectConfig['dialogueDensity']): number {
  const map = { extreme: 280, high: 240, balanced: 200, narrative: 160 }
  return map[density]
}

function getDensityRatio(density: ProjectConfig['dialogueDensity']): string {
  const map = { extreme: '≥80%', high: '≥65%', balanced: '约50%', narrative: '<50%' }
  return map[density]
}

const GENRE_LABELS: Record<string, string> = {
  romance: '甜宠',
  comedy: '喜剧',
  suspense: '悬疑',
  revenge: '复仇爽剧',
  darkRevenge: '暗黑复仇',
  cyberpunk: '赛博朋克',
  ancient: '古风宫斗',
  urbanFantasy: '都市异能',
  rebirth: '穿越重生',
  apocalypse: '末世求生',
  system: '系统觉醒',
}

const PACE_LABELS: Record<string, string> = {
  ultra: '极速癫（每集必有反转，无废话）',
  fast: '快节奏爽感（强情节推进）',
  slow_burn: '虐心慢熬（积累委屈后爆发）',
}

const AUDIENCE_LABELS: Record<string, string> = {
  'f18-24': '18-24岁女性',
  'f25-35': '25-35岁女性',
  'm18-30': '18-30岁男性',
  'all-age': '全年龄段',
}

export function buildPlanningPrompt(config: ProjectConfig, ideation: IdeationCard): string {
  const platform = PLATFORM_SPECS[config.platform]
  const wordsPerEpisode = getWordsPerMinute(config.dialogueDensity) * config.episodeDuration
  const genreNames = config.genres.map(g => GENRE_LABELS[g] || g).join('/')
  const audienceNames = config.targetAudience.map(a => AUDIENCE_LABELS[a] || a).join('、')

  return `你是AI漫剧结构设计专家。根据以下项目参数，生成完整的全集规划。

【项目信息】
- 剧名：${config.title || ideation.title}
- 故事核心：${ideation.logline}
- 总集数：${config.totalEpisodes} 集
- 每集时长：${config.episodeDuration} 分钟
- 每集约 ${wordsPerEpisode} 字（含台词+场景描述）
- 剧本类型：${genreNames}
- 节奏风格：${PACE_LABELS[config.paceStyle]}
- 台词密度：${config.dialogueDensity}（台词占比约${getDensityRatio(config.dialogueDensity)}）
- 目标平台：${platform.name}（${platform.spec}）
- 梗文化强度：${config.memeIntensity}/5
- 受众：${audienceNames}

【核心情感】${ideation.coreEmotion}
【流量底座】${ideation.trafficBase}
【时代情绪】${ideation.eraEmotion}
【核心钩子】${ideation.hook}

请输出完整的全集规划 JSON，不要输出任何其他内容，严格按照以下结构：

{
  "projectId": "proj_${Date.now()}",
  "acts": [
    {
      "name": "幕名称（建立/激化/最黑暗时刻/反转/余震）",
      "episodeRange": [起始集数, 结束集数],
      "emotionTarget": "本幕情绪目标（≤30字）"
    }
  ],
  "characters": [
    {
      "name": "角色名",
      "role": "protagonist 或 antagonist 或 supporting",
      "archetype": "人设标签（≤10字）",
      "flaw": "人性劣根性（必填，≤20字）",
      "arc": "成长弧（≤30字）",
      "signatureLine": "标志性台词（≤20字）"
    }
  ],
  "plotBombs": [
    {
      "episodeNumber": 集数,
      "type": "identity_reveal 或 betrayal 或 twist 或 emotional_peak",
      "description": "反转描述（≤50字）"
    }
  ],
  "hotEpisodes": [集数数组，3-5个预测爆款集],
  "episodes": [
    {
      "episodeNumber": 1,
      "title": "第一集标题",
      "synopsis": "2-3行梗概（≤100字）",
      "hookType": "emotion_unresolved 或 info_bomb 或 identity_question 或 cp_tension 或 moral_dilemma 或 cliffhanger",
      "emotionTarget": "本集情绪目标（≤20字）",
      "nodeType": "normal 或 plot_bomb 或 major_twist 或 emotional_peak 或 comedy_peak",
      "emotionPeak": 1到10的整数
    }
  ]
}

【爆款结构规则】（必须遵守）
1. acts 必须是5幕结构：建立（前20%集）、激化（20-40%）、最黑暗时刻（40-55%）、反转（55-80%）、余震（80-100%）
2. 前3集：高密度入场，每集必须有反转（nodeType为 plot_bomb 或 major_twist）
3. 每10集：至少1个 plotBombs 爆点（identity_reveal/betrayal/major_twist之一）
4. 总集数30%处：第一个剧情低谷（emotionPeak最低点）
5. 总集数60%处：主角真正觉醒（nodeType=major_twist，emotionPeak≥8）
6. 最后5集：情绪总爆发，emotionPeak全部≥8
7. 结尾集：预留续集口（nodeType=cliffhanger 或 major_twist）
8. hotEpisodes 标注第1集、约30%处、约60%处、倒数第2集
9. hookType 不能连续3集相同
10. emotionPeak 形成波浪曲线，不能连续3集相同值
11. episodes 数组必须包含全部 ${config.totalEpisodes} 集

只输出JSON，不输出任何其他文字。`
}
