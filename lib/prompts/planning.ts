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
  const wordsPerEpisode = Math.round(getWordsPerMinute(config.dialogueDensity) * config.episodeDuration)
  const genreNames = config.genres.map(g => GENRE_LABELS[g] || g).join('/')
  const audienceNames = config.targetAudience.map(a => AUDIENCE_LABELS[a] || a).join('、')
  const aspectRatioText = (config as { aspectRatio?: string }).aspectRatio || '9:16'

  return `你是AI漫剧结构设计专家。根据以下项目参数，生成完整的全集规划JSON。

【项目】剧名:${config.title||ideation.title} | 总集数:${config.totalEpisodes}集 | 每集:${config.episodeDuration}分钟/${wordsPerEpisode}字 | 比例:${aspectRatioText}
【类型】${genreNames} | 节奏:${PACE_LABELS[config.paceStyle]} | 台词:${getDensityRatio(config.dialogueDensity)} | 梗度:${config.memeIntensity}/5
【平台】${platform.name}(${platform.spec}) | 受众:${audienceNames}
【故事】${ideation.logline}
【情感】核心:${ideation.coreEmotion} | 流量底座:${ideation.trafficBase} | 钩子:${ideation.hook}

严格只输出JSON对象，不含任何其他文字，结构如下：

{
  "projectId": "proj_${Date.now()}",
  "acts": [{"name":"幕名","episodeRange":[1,N],"emotionTarget":"≤20字"}],
  "characters": [{"name":"名","role":"protagonist|antagonist|supporting","archetype":"≤8字","flaw":"≤15字","arc":"≤20字","signatureLine":"≤15字"}],
  "plotBombs": [{"episodeNumber":N,"type":"identity_reveal|betrayal|twist|emotional_peak","description":"≤30字"}],
  "hotEpisodes": [N,N,N,N],
  "episodes": [
    {"episodeNumber":1,"title":"标题","synopsis":"≤30字","hookType":"emotion_unresolved|info_bomb|identity_question|cp_tension|moral_dilemma|cliffhanger","emotionTarget":"≤15字","nodeType":"normal|plot_bomb|major_twist|emotional_peak|comedy_peak","emotionPeak":1-10}
  ]
}

【规则】
1. acts=5幕:建立(前20%)/激化(20-40%)/黑暗(40-55%)/反转(55-80%)/余震(80-100%)
2. 前3集nodeType必须是plot_bomb或major_twist
3. 每10集至少1个plotBombs爆点
4. 30%集处emotionPeak最低; 60%集处major_twist且peak≥8; 末5集peak全≥8
5. hookType不连续3集相同; emotionPeak波浪曲线不连续3集同值
6. episodes必须包含全部${config.totalEpisodes}集，episodeNumber从1到${config.totalEpisodes}连续
7. synopsis严格≤30字，节省token

只输出JSON。`
}
