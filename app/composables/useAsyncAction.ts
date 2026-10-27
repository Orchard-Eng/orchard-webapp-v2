export type AsyncActionState = 'idle' | 'pending' | 'success' | 'error'

export function useAsyncAction() {
  const state = ref<AsyncActionState>('idle')
  const error = ref<unknown>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    state.value = 'pending'
    error.value = null
    try {
      const result = await fn()
      state.value = 'success'
      return result
    } catch (err) {
      error.value = err
      state.value = 'error'
      return undefined
    }
  }

  return { state, error, run }
}
