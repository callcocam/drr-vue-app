// composables/useHistory.js
import { ref, computed } from 'vue'

export const useHistory = (canvasElements, selectedElementIds) => {
  const history = ref({
    states: [],
    currentIndex: -1
  })

  const saveState = () => {
    if (history.value.currentIndex < history.value.states.length - 1) {
      history.value.states = history.value.states.slice(0, history.value.currentIndex + 1)
    }

    history.value.states.push(JSON.stringify({
      elements: canvasElements.value,
      selection: Array.from(selectedElementIds.value)
    }))
    history.value.currentIndex++

    if (history.value.states.length > 50) {
      history.value.states = history.value.states.slice(-50)
      history.value.currentIndex = history.value.states.length - 1
    }
  }

  const canUndo = computed(() => history.value.currentIndex > 0)
  const canRedo = computed(() => history.value.currentIndex < history.value.states.length - 1)

  const undo = () => {
    if (!canUndo.value) return

    history.value.currentIndex--
    const previousState = JSON.parse(history.value.states[history.value.currentIndex])
    canvasElements.value = previousState.elements
    selectedElementIds.value = new Set(previousState.selection)
  }

  const redo = () => {
    if (!canRedo.value) return

    history.value.currentIndex++
    const nextState = JSON.parse(history.value.states[history.value.currentIndex])
    canvasElements.value = nextState.elements
    selectedElementIds.value = new Set(nextState.selection)
  }

  return {
    canUndo,
    canRedo,
    saveState,
    undo,
    redo
  }
}
