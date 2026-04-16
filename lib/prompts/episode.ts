import type { ProjectConfig, SeriesPlan, EpisodeOutline } from '../types'
import { PLATFORM_SPECS } from '../platform-presets'

function getWordsPerMinute(density: ProjectConfig['dialogueDensity']): number {
  const map = { extreme: 280, high: 240, balanced: 200, narrative: 160 }
  return map[density]
}

function getDensityRatio(density: ProjectConfig['dialogueDensity']): string {
  const map = { extreme: '≥80%', high: '≥65%', balanced: '约50%', narrative: '<50%' }
  return map[density]
}

function getMemeGuide(intensity: number): string {
  const guides: Record<number, string> = {
    1: '偶尔出现1-2个互联网词汇即可，不刻意堆梗',
    2: '每场景可以有1个梗，用当下流行语，自然融入',
    3: '台词中度使用互联网黑话，角色说话带B站/微博/小红书语感',
    4: '高密度互联网语境，角色说话像在发微博，充满熟悉的网络梗',
    5: '极度癫，全程梗/黑话/表情包文字/热点隐喻，观众看了想截图发群',
  }
  return guides[intensity] || guides[3]
}

function getBeatTimings(durationMinutes: number): Array<{ range: string; function: string }> {
  const totalSeconds = durationMinutes * 60
  const r = (ratio: number) => Math.round(totalSeconds * ratio)
  return [
    {
      range: `0-${r(0.15)}秒`,
      function: '入场券：视觉奇观/冲突现场/熟悉感触发（前3秒必须抓住）',
    },
    {
      range: `${r(0.15)}-${r(0.45)}秒`,
      function: '代入感堆积：情境建立，给观众填充情绪预期',
    },
    {
      range: `${r(0.45)}-${r(0.65)}秒`,
      function: '第一反转：情理之中意料之外，必须可截图',
    },
    {
      range: `${r(0.65)}-${r(0.85)}秒`,
      function: '情绪高潮：爽点/虐点/笑点顶峰',
    },
    {
      range: `${r(0.85)}-${totalSeconds}秒`,
      function: '悬念钩子：情绪未解决/信息炸弹/「等一下这是什么意思」',
    },
  ]
}

const NODE_TYPE_LABELS: Record<string, string> = {
  normal: '普通推进集',
  plot_bomb: '爆点集',
  major_twist: '大反转集',
  emotional_peak: '情感高潮集',
  comedy_peak: '喜剧高潮集',
}

const HOOK_TYPE_LABELS: Record<string, string> = {
  emotion_unresolved: '情绪未解决',
  info_bomb: '信息炸弹',
  identity_question: '身份悬念',
  cp_tension: 'CP张力',
  moral_dilemma: '道德困境',
  cliffhanger: '悬崖式',
}

export function buildEpisodePrompt(
  config: ProjectConfig,
  plan: SeriesPlan,
  episodeOutline: EpisodeOutline,
  previousEpisodeHook: string | null,
  adoptedSuggestion?: string
): string {
  const platform = PLATFORM_SPECS[config.platform]
  const targetWords = Math.round(getWordsPerMinute(config.dialogueDensity) * config.episodeDuration)
  const beatTimings = getBeatTimings(config.episodeDuration)
  const protagonists = plan.characters.filter(c => c.role === 'protagonist')
  const antagonists = plan.characters.filter(c => c.role === 'antagonist')
  const nodeLabel = NODE_TYPE_LABELS[episodeOutline.nodeType] || episodeOutline.nodeType
  const hookLabel = HOOK_TYPE_LABELS[episodeOutline.hookType] || episodeOutline.hookType

  return `你是一个只懂爆款不懂文学的AI编剧。写出让人停不下来的剧本，不是让人回味的剧本。

【全剧设定概要】
剧名：${config.title}
类型：${config.genres.join('/')}${config.coreConflict ? `\n核心冲突：${config.coreConflict}` : ''}${config.worldBuilding ? `\n世界观：${config.worldBuilding}` : ''}
主角：${protagonists.map(c => `${c.name}（${c.archetype}，劣根性：${c.flaw}）`).join('、') || '待定'}
反派：${antagonists.map(c => `${c.name}（${c.archetype}，合理性：${c.flaw}）`).join('、') || '无'}

【当前集信息】
第 ${episodeOutline.episodeNumber} 集 / 共 ${config.totalEpisodes} 集
本集标题：${episodeOutline.title}
节点类型：${nodeLabel}
本集梗概：${episodeOutline.synopsis}
本集情绪目标：${episodeOutline.emotionTarget}
本集钩子类型：${hookLabel}
${previousEpisodeHook ? `上集末尾钩子：${previousEpisodeHook}` : '（第一集，无上集钩子）'}

【输出规格】
- 总字数：约 ${targetWords} 字
- 台词密度：${config.dialogueDensity}（台词占全文 ${getDensityRatio(config.dialogueDensity)}）
- 平台：${platform.name}，${platform.spec}
- 梗文化强度：${config.memeIntensity}/5（${getMemeGuide(config.memeIntensity)}）

【节拍时间线】（严格按此结构写）
${beatTimings.map(b => `${b.range}：${b.function}`).join('\n')}

【剧本输出格式】（简体中文主标注，括号内为国际通用格式对照）

---集前情报---
上集情绪状态：[填写]
本集情绪账：[填写]
目标观众反应：[填写]

---节拍时间线---
[按节拍简述每段核心内容]

---剧本正文---

淡入（Fade In）

内景（INT.） 场景名称 · 白天（或：外景（EXT.） 场景名称 · 夜晚/黄昏/清晨/凌晨）
${config.visualStylePrompt ? `（画面提示词：基于「${config.visualStylePrompt}」风格）` : ''}
场景动作描述（简洁，≤50字）

角色名
（括号内是动作/情绪/镜头指示）
台词内容

角色名（画外音/O.S.）
（角色不在画面中时使用）
台词内容

旁白（内心独白/V.O.）
内心旁白内容

△（Cut To）

角色名（续/Cont'd）
（同一场景角色连续说话时使用）
台词内容

淡出（Fade Out）

---编剧备注---
本集埋设线索：[列出]
下集情绪账：[填写，这是下集剧本的起点]
可截图时刻：[标注集内时间点+画面描述]
预测弹幕词：[3-5个词]
反转计数：本集共X个反转
实际台词占比：约X%

【格式说明（简体中文主标注，括号内国际对照）】
- 内景（INT.）：室内场景；外景（EXT.）：室外场景
- 时间：白天 / 夜晚 / 黄昏 / 清晨 / 凌晨
- 画外音（O.S.）：角色不在画面中说话，写法：角色名（画外音/O.S.）
- 内心独白（V.O.）：叙事旁白，写法：旁白（内心独白/V.O.）
- △（Cut To）：快速剪辑过渡，单独一行
- 淡入（Fade In）/ 淡出（Fade Out）：集首尾使用
- （续/Cont'd）：同一角色在同一场景连续对话

【强制写作规则】
1. 台词极简律：≤15字/句优先，同等信息量选最少字数，最短台词往往最有力量
2. 对白反转律（核心）：每连续2-3句对白必须埋一个「反转」或「信息炸弹」，观众绝对猜不到下一句，但事后感觉必然合理——「在情理之中，意料之外」
3. 留人钩子：每个场景结尾至少一句台词让观众产生「等等，这是什么意思？」的感觉，制造强制性情绪账
4. 反转密度：本集至少3个反转，分布在开头/中段/结尾，不连续堆叠
5. 结尾钩子：情绪未解决（不是情节未解决），让人「必须」看下一集
6. 道德灰区：不让观众确定谁对谁错，为评论区争议留空间
7. 反差萌：至少一处角色表面人设与实际行为的最大落差，制造截图时刻
8. 梗植入：${getMemeGuide(config.memeIntensity)}
9. 禁止清单：哲学独白、文学性描写、完美主角、废话寒暄、解释性旁白、重复已知信息
10. 场景描述限制：${getDensityRatio(config.dialogueDensity) === '≥80%' ? '≤30字/场景，用镜头语言代替文字描述' : getDensityRatio(config.dialogueDensity) === '≥65%' ? '≤60字/场景' : '≤100字/场景'}${adoptedSuggestion ? `\n\n【编剧优化指令】上一版本存在问题：${adoptedSuggestion}。请在本次重写中重点修正这个问题。` : ''}`
}
