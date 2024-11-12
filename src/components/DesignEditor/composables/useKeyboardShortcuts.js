// src/components/DesignEditor/composables/useKeyboardShortcuts.js

import { onBeforeUnmount } from 'vue'
import { EDITOR_CONFIG } from '../config/editorConfig'



export function useKeyboardShortcuts({
    undo,
    redo,
    handleCopy,
    handlePaste,
    handleCut,
    handleDelete,
    handleDuplicate,
    addToSelection,
    canvasElements,
    selectedElementsArray,
    editingElementId,
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward
}) {
    const isInputElement = (element) => {
        return element.tagName === 'INPUT' || element.tagName === 'TEXTAREA'
    }

    const isModifierKey = (event) => {
        return event.ctrlKey || event.metaKey
    }

    const handleMovement = (event) => {
        const { NORMAL_STEP, FAST_STEP } = EDITOR_CONFIG.KEYBOARD_SHORTCUTS.MOVEMENT
        const step = event.shiftKey ? FAST_STEP : NORMAL_STEP

        const movements = {
            ArrowLeft: { x: -step, y: 0 },
            ArrowRight: { x: step, y: 0 },
            ArrowUp: { x: 0, y: -step },
            ArrowDown: { x: 0, y: step }
        }

        const movement = movements[event.key]
        if (!movement) return false

        event.preventDefault()
        selectedElementsArray.value.forEach(element => {
            element.x += movement.x
            element.y += movement.y
        })

        return true
    }

    const handleKeyboardShortcut = (event) => {
        if (editingElementId.value) return // Ignora atalhos se estiver editando texto
        // Ignora eventos de teclado em campos de input
        if (isInputElement(event.target)) return

        // Trata movimentação com setas
        if (handleMovement(event)) return

        // Trata comandos com modificadores (Ctrl/Cmd)
        if (isModifierKey(event)) {
            const key = event.key.toLowerCase()
            const isShiftPressed = event.shiftKey

            const shortcuts = {
                'c': handleCopy,
                'v': handlePaste,
                'x': handleCut,
                'z': () => isShiftPressed ? redo() : undo(),
                'y': redo,
                'a': (e) => {
                    e.preventDefault()
                    canvasElements.value.forEach(element => addToSelection(element.id))
                },
                'd': (e) => {
                    e.preventDefault()
                    handleDuplicate()
                }
            }

            const handler = shortcuts[key]
            if (handler) {
                event.preventDefault()
                handler(event)
                return
            }
        }

        // Trata teclas de deleção
        if (['Delete', 'Backspace'].includes(event.key)) {
            event.preventDefault()
            handleDelete()
        }
        if (event.ctrlKey && event.shiftKey && event.key === ']') {
            event.preventDefault()
            bringToFront()
        }
        if (event.ctrlKey && event.shiftKey && event.key === '[') {
            event.preventDefault()
            sendToBack()
        }
        if (event.ctrlKey && !event.shiftKey && event.key === ']') {
            event.preventDefault()
            bringForward()
        }
        if (event.ctrlKey && !event.shiftKey && event.key === '[') {
            event.preventDefault()
            sendBackward()
        }
    }

    const setupKeyboardShortcuts = () => {
        window.addEventListener('keydown', handleKeyboardShortcut)

        onBeforeUnmount(() => {
            window.removeEventListener('keydown', handleKeyboardShortcut)
        })
    }

    return {
        setupKeyboardShortcuts
    }
}

// Função auxiliar para validar combinações de teclas
export function matchesKeyboardShortcut(event, shortcuts) {
    return shortcuts.some(shortcut => {
        const keys = shortcut.toLowerCase().split('+')
        const mainKey = keys[keys.length - 1]

        const hasRequiredModifiers = keys.slice(0, -1).every(modifier => {
            switch (modifier) {
                case 'ctrl':
                    return event.ctrlKey
                case 'cmd':
                    return event.metaKey
                case 'shift':
                    return event.shiftKey
                case 'alt':
                    return event.altKey
                default:
                    return false
            }
        })

        return hasRequiredModifiers && event.key.toLowerCase() === mainKey
    })
}