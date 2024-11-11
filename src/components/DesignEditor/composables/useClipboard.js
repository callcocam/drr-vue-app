// composables/useClipboard.js
import { ref } from 'vue'

export const useClipboard = () => {
  const clipboard = ref(null)

  const copyElements = (elements) => {
    clipboard.value = elements.map(element => ({ ...element }))
  }

  const pasteElements = (nextId, nextZIndex) => {
    if (!clipboard.value?.length) return []

    const offset = 20
    return clipboard.value.map(element => ({
      ...element,
      id: nextId(),
      x: element.x + offset,
      y: element.y + offset,
      zIndex: nextZIndex()
    }))
  }

  return {
    clipboard,
    copyElements,
    pasteElements
  }
}
