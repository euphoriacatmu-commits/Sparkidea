export function buildParseOutlinePrompt(outlineText: string): string {
  return `你是一个资深AI漫剧开发编辑。用户上传了一份剧本大纲，你需要提取关键信息。

大纲内容：
---
${outlineText.slice(0, 50000)}
---
${outlineText.length > 50000 ? '\n[注：原文较长，已截取前50000字进行分析]' : ''}

请输出纯 JSON，结构如下，不要输出任何其他内容：
{
  "title": "识别到的剧名，无则空字符串",
  "synopsis": "整体故事梗概（100字内）",
  "mainCharacters": [
    {
      "name": "角色名",
      "role": "protagonist 或 antagonist 或 supporting",
      "archetype": "人设标签（≤10字）",
      "flaw": "人性劣根性（从大纲推断，无则根据角色类型建议，≤20字）",
      "arc": "成长弧简述（≤30字）",
      "signatureLine": "推荐标志性台词（≤20字）"
    }
  ],
  "emotionCore": "核心情感（love 或 hate 或 fear 或 resentment）",
  "existingPlotPoints": ["关键情节节点1", "关键情节节点2"],
  "suggestedGenre": ["romance", "comedy", "suspense", "revenge", "darkRevenge", "cyberpunk", "ancient", "urbanFantasy", "rebirth", "apocalypse", "system"],
  "confidence": "high 或 medium 或 low"
}

注意：
- suggestedGenre 从给定列表中最多选3个，放入数组
- emotionCore 只能是：love、hate、fear、resentment 之一
- confidence：信息丰富为 high，信息不足为 low
- 如字段无法判断，给出合理推断
- 只输出JSON，不附加任何说明`
}
