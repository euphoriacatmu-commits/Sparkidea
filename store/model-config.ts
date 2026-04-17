import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import {
  DEFAULT_SETTINGS,
  getDefaultTaskModels,
  type ModelSettings,
  type Provider,
} from '@/lib/model-config'

interface ModelConfigStore {
  settings: ModelSettings

  setProvider: (provider: Provider) => void
  setApiKey: (key: string) => void
  setTaskModel: (task: keyof ModelSettings['taskModels'], modelId: string) => void
  setVolcengineEndpoint: (task: keyof ModelSettings['volcengineEndpoints'], ep: string) => void
  resetToDefaults: () => void
}

export const useModelConfigStore = create<ModelConfigStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      setProvider: (provider) =>
        set((state) => ({
          settings: {
            ...state.settings,
            provider,
            // 切换 provider 时重置 taskModels 为该 provider 默认值
            taskModels: getDefaultTaskModels(provider),
          },
        })),

      setApiKey: (key) =>
        set((state) => ({
          settings: { ...state.settings, apiKey: key },
        })),

      setTaskModel: (task, modelId) =>
        set((state) => ({
          settings: {
            ...state.settings,
            taskModels: { ...state.settings.taskModels, [task]: modelId },
          },
        })),

      setVolcengineEndpoint: (task, ep) =>
        set((state) => ({
          settings: {
            ...state.settings,
            volcengineEndpoints: { ...state.settings.volcengineEndpoints, [task]: ep },
          },
        })),

      resetToDefaults: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    {
      name: 'sparkidea-model-config',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return { getItem: () => null, setItem: () => {}, removeItem: () => {} }
        }
        return localStorage
      }),
    }
  )
)
