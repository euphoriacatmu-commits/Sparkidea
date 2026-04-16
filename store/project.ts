import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  ProjectConfig,
  IdeationCard,
  SeriesPlan,
  Episode,
  ParsedOutline,
  QualityWarning,
  ProjectMeta,
} from '@/lib/types'

export interface ProjectStore {
  // 数据状态
  userInput: string
  ideationCards: IdeationCard[]
  selectedCard: IdeationCard | null
  config: ProjectConfig | null
  parsedOutline: ParsedOutline | null
  seriesPlan: SeriesPlan | null
  episodes: Record<number, Episode>
  generatedEpisodeNumbers: number[]
  savedProjects: ProjectMeta[]

  // UI 状态
  isLoading: boolean
  currentEpisodeNumber: number
  streamingContent: string
  streamingEpisodeNumber: number | null
  qualityWarnings: QualityWarning[]

  // 操作
  setUserInput: (text: string) => void
  setIdeationCards: (cards: IdeationCard[]) => void
  appendIdeationCards: (cards: IdeationCard[]) => void
  setSelectedCard: (card: IdeationCard) => void
  setConfig: (config: ProjectConfig) => void
  setParsedOutline: (outline: ParsedOutline) => void
  setSeriesPlan: (plan: SeriesPlan) => void
  addEpisode: (episode: Episode) => void
  updateEpisode: (n: number, partial: Partial<Episode>) => void
  setCurrentEpisodeNumber: (n: number) => void
  setStreamingContent: (content: string) => void
  appendStreamingContent: (chunk: string) => void
  setStreamingEpisodeNumber: (n: number | null) => void
  setIsLoading: (loading: boolean) => void
  setQualityWarnings: (warnings: QualityWarning[]) => void
  saveCurrentProject: () => void
  reset: () => void
}

const initialState = {
  userInput: '',
  ideationCards: [],
  selectedCard: null,
  config: null,
  parsedOutline: null,
  seriesPlan: null,
  episodes: {},
  generatedEpisodeNumbers: [],
  savedProjects: [] as ProjectMeta[],
  isLoading: false,
  currentEpisodeNumber: 1,
  streamingContent: '',
  streamingEpisodeNumber: null,
  qualityWarnings: [],
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      ...initialState,

      setUserInput: (text) => set({ userInput: text }),

      setIdeationCards: (cards) => set({ ideationCards: cards }),

      appendIdeationCards: (cards) =>
        set((state) => ({
          ideationCards: [...state.ideationCards, ...cards].slice(0, 9),
        })),

      setSelectedCard: (card) => set({ selectedCard: card }),

      setConfig: (config) => set({ config }),

      setParsedOutline: (outline) => set({ parsedOutline: outline }),

      setSeriesPlan: (plan) => set({ seriesPlan: plan }),

      addEpisode: (episode) =>
        set((state) => ({
          episodes: { ...state.episodes, [episode.episodeNumber]: episode },
          generatedEpisodeNumbers: Array.from(
            new Set(state.generatedEpisodeNumbers.concat(episode.episodeNumber))
          ).sort((a, b) => a - b),
        })),

      updateEpisode: (n, partial) =>
        set((state) => ({
          episodes: {
            ...state.episodes,
            [n]: { ...state.episodes[n], ...partial },
          },
        })),

      setCurrentEpisodeNumber: (n) => set({ currentEpisodeNumber: n }),

      setStreamingContent: (content) => set({ streamingContent: content }),

      appendStreamingContent: (chunk) =>
        set((state) => ({ streamingContent: state.streamingContent + chunk })),

      setStreamingEpisodeNumber: (n) => set({ streamingEpisodeNumber: n }),

      setIsLoading: (loading) => set({ isLoading: loading }),

      setQualityWarnings: (warnings) => set({ qualityWarnings: warnings }),

      saveCurrentProject: () =>
        set((state) => {
          if (!state.config || !state.seriesPlan) return state
          const id = state.seriesPlan.projectId
          const meta: ProjectMeta = {
            id,
            title: state.config.title,
            genres: state.config.genres,
            platform: state.config.platform,
            totalEpisodes: state.config.totalEpisodes,
            episodeDuration: state.config.episodeDuration,
            createdAt: state.savedProjects.find(p => p.id === id)?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            episodesGenerated: state.generatedEpisodeNumbers.length,
          }
          const existing = state.savedProjects.findIndex(p => p.id === id)
          const savedProjects = existing >= 0
            ? state.savedProjects.map((p, i) => i === existing ? meta : p)
            : [meta, ...state.savedProjects]
          return { savedProjects }
        }),

      reset: () => set((state) => ({ ...initialState, savedProjects: state.savedProjects })),
    }),
    {
      name: 'sparkidea-project',
      storage: createJSONStorage(() => {
        // 安全处理 SSR 环境
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return localStorage
      }),
      // 持久化数据状态，排除瞬态 UI 状态
      partialize: (state) => ({
        userInput: state.userInput,
        ideationCards: state.ideationCards,
        selectedCard: state.selectedCard,
        config: state.config,
        parsedOutline: state.parsedOutline,
        seriesPlan: state.seriesPlan,
        episodes: state.episodes,
        generatedEpisodeNumbers: state.generatedEpisodeNumbers,
        currentEpisodeNumber: state.currentEpisodeNumber,
        savedProjects: state.savedProjects,
      }),
    }
  )
)
