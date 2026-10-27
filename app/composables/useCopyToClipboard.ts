export function useCopyToClipboard() {
  const copied = ref(false)
  let resetTimer: ReturnType<typeof setTimeout> | null = null

  async function copy(text: string) {
    await navigator.clipboard.writeText(text)
    copied.value = true
    if (resetTimer) clearTimeout(resetTimer)
    resetTimer = setTimeout(() => {
      copied.value = false
    }, 1500)
  }

  return { copy, copied }
}
