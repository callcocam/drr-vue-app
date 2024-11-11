import { ref, computed } from 'vue'

export function useHistory(initialState = []) {
  const history = ref([initialState])
  const currentIndex = ref(0)

  const canUndo = computed(() => currentIndex.value > 0)
  const canRedo = computed(() => currentIndex.value < history.value.length - 1)

  const addToHistory = (newState) => {
    if (currentIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, currentIndex.value + 1)
    }

    history.value.push(JSON.parse(JSON.stringify(newState)))
    currentIndex.value++

    if (history.value.length > 50) {
      history.value = history.value.slice(-50)
      currentIndex.value = history.value.length - 1
    }
  }

  const undo = () => {
    if (canUndo.value) {
      currentIndex.value--
      return JSON.parse(JSON.stringify(history.value[currentIndex.value]))
    }
    return null
  }

  const redo = () => {
    if (canRedo.value) {
      currentIndex.value++
      return JSON.parse(JSON.stringify(history.value[currentIndex.value]))
    }
    return null
  }

  return {
    canUndo,
    canRedo,
    addToHistory,
    undo,
    redo
  }
}