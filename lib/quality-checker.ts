import type { Episode, EpisodeOutline, QualityWarning, ProjectConfig } from './types'

function getDensityTargetRatio(density: ProjectConfig['dialogueDensity']): number {
  const map = { extreme: 0.8, high: 0.65, balanced: 0.5, narrative: 0.4 }
  return map[density]
}

function getAlternativeHooks(currentType: string): string[] {
  const allHooks = [
    'emotion_unresolved',
    'info_bomb',
    'identity_question',
    'cp_tension',
    'moral_dilemma',
    'cliffhanger',
  ]
  const hookLabels: Record<string, string> = {
    emotion_unresolved: '情绪未解决',
    info_bomb: '信息炸弹',
    identity_question: '身份悬念',
    cp_tension: 'CP张力',
    moral_dilemma: '道德困境',
    cliffhanger: '悬崖式',
  }
  return allHooks
    .filter(h => h !== currentType)
    .slice(0, 3)
    .map(h => hookLabels[h])
}

export function checkQuality(
  episodes: Episode[],
  config: ProjectConfig
): QualityWarning[] {
  const warnings: QualityWarning[] = []
  const recent = episodes.slice(-5)

  // 规则1：连续3集无反转（twistCount === 0）
  let noTwistStreak = 0
  for (const ep of recent) {
    if ((ep.metadata?.twistCount ?? 0) === 0) {
      noTwistStreak++
    } else {
      noTwistStreak = 0
    }
  }
  if (noTwistStreak >= 3) {
    warnings.push({
      type: 'no_twist',
      severity: 'error',
      message: `已连续 ${noTwistStreak} 集没有反转`,
      suggestion: '建议下一集注入反转：身份揭露 / 背叛 / 意外反击 / 信息炸弹',
    })
  }

  // 规则2：同类钩子连续重复超3次
  if (recent.length >= 3) {
    const recentHooks = recent.map(e => e.metadata?.hookType)
    let hookRepeatCount = 1
    const lastHook = recentHooks[recentHooks.length - 1]
    for (let i = recentHooks.length - 2; i >= 0; i--) {
      if (recentHooks[i] === lastHook) {
        hookRepeatCount++
      } else {
        break
      }
    }
    if (hookRepeatCount >= 3 && lastHook) {
      const hookLabels: Record<string, string> = {
        emotion_unresolved: '情绪未解决',
        info_bomb: '信息炸弹',
        identity_question: '身份悬念',
        cp_tension: 'CP张力',
        moral_dilemma: '道德困境',
        cliffhanger: '悬崖式',
      }
      warnings.push({
        type: 'hook_repeat',
        severity: 'warn',
        message: `「${hookLabels[lastHook] || lastHook}」类型钩子已连用 ${hookRepeatCount} 次`,
        suggestion: `切换为：${getAlternativeHooks(lastHook).join(' 或 ')}`,
      })
    }
  }

  // 规则3：台词密度低于设定值
  const latestEpisode = episodes[episodes.length - 1]
  const targetRatio = getDensityTargetRatio(config.dialogueDensity)
  if (latestEpisode?.metadata?.dialogueRatio !== undefined &&
      latestEpisode.metadata.dialogueRatio < targetRatio - 0.1) {
    warnings.push({
      type: 'low_dialogue',
      severity: 'warn',
      message: `本集台词占比 ${Math.round(latestEpisode.metadata.dialogueRatio * 100)}%，低于设定的 ${Math.round(targetRatio * 100)}%`,
      suggestion: '将叙述段改为角色对白，增加信息密度',
    })
  }

  // 规则4：每10集诊断情绪曲线平坦
  if (episodes.length % 10 === 0 && episodes.length >= 10) {
    const last10 = episodes.slice(-10)
    const peaks = last10.map(e => e.metadata?.estimatedDuration || 5)
    const maxPeak = Math.max(...peaks)
    const minPeak = Math.min(...peaks)
    if (maxPeak - minPeak < 1) {
      warnings.push({
        type: 'emotion_flat',
        severity: 'warn',
        message: `近10集情绪曲线过于平坦，观众可能已疲软`,
        suggestion: '建议插入：意外事件 / 人物关系大反转 / 新威胁登场',
      })
    }
  }

  return warnings
}

export function checkQualityFromOutlines(
  outlines: EpisodeOutline[],
  config: ProjectConfig
): QualityWarning[] {
  const warnings: QualityWarning[] = []

  // 规则1：连续3集非悬念/反转结尾
  let noCliffStreak = 0
  for (const ep of outlines) {
    if (ep.nodeType === 'normal') {
      noCliffStreak++
      if (noCliffStreak >= 3) {
        warnings.push({
          type: 'no_twist',
          severity: 'error',
          message: `第 ${ep.episodeNumber - 2} 集起连续 ${noCliffStreak} 集为普通推进节点，缺少高潮`,
          suggestion: '建议在此处安排爆点集或大反转集，提高情节密度',
        })
        noCliffStreak = 0
      }
    } else {
      noCliffStreak = 0
    }
  }

  // 规则2：同类钩子连续3次
  let hookStreak = 0
  let lastHook = ''
  for (const ep of outlines) {
    if (ep.hookType === lastHook) {
      hookStreak++
      if (hookStreak >= 3) {
        const hookLabels: Record<string, string> = {
          emotion_unresolved: '情绪未解决',
          info_bomb: '信息炸弹',
          identity_question: '身份悬念',
          cp_tension: 'CP张力',
          moral_dilemma: '道德困境',
          cliffhanger: '悬崖式',
        }
        warnings.push({
          type: 'hook_repeat',
          severity: 'warn',
          message: `「${hookLabels[ep.hookType] || ep.hookType}」类型钩子在第 ${ep.episodeNumber - 2} 集起连用 ${hookStreak} 次`,
          suggestion: `切换为：${getAlternativeHooks(ep.hookType).join(' 或 ')}`,
        })
        hookStreak = 0
      }
    } else {
      hookStreak = 1
      lastHook = ep.hookType
    }
  }

  // 规则4：每10集情绪曲线检测
  for (let start = 0; start < outlines.length; start += 10) {
    const chunk = outlines.slice(start, start + 10)
    if (chunk.length < 5) continue
    const peaks = chunk.map(e => e.emotionPeak ?? 5)
    const maxP = Math.max(...peaks)
    const minP = Math.min(...peaks)
    if (maxP - minP < 2) {
      warnings.push({
        type: 'emotion_flat',
        severity: 'warn',
        message: `第 ${chunk[0].episodeNumber}-${chunk[chunk.length - 1].episodeNumber} 集情绪曲线过于平坦（峰谷差仅 ${maxP - minP}）`,
        suggestion: '建议在此段增加情绪波动：安排一个高潮（emotionPeak≥8）和一个低谷（emotionPeak≤3）',
      })
    }
  }

  return warnings
}
