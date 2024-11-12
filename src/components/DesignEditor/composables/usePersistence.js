// usePersistence.js
import { ref } from 'vue'
import { debugLog } from '@/components/DesignEditor/utils/debug'

export const usePersistence = (canvasElements, canvasWidth, canvasHeight, canvasZoom) => {
    const isSaving = ref(false)
    const isLoading = ref(false)

    // Serializa o estado do editor para JSON
    const serializeState = () => {
        const state = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            canvas: {
                width: canvasWidth.value,
                height: canvasHeight.value,
                zoom: canvasZoom.value
            },
            elements: canvasElements.value.map(element => ({
                ...element,
                // Remove propriedades temporárias ou de runtime que não precisam ser salvas
                _selected: undefined,
                _hover: undefined,
                _temp: undefined
            }))
        }
        return state
    }

    // Carrega o estado do editor a partir do JSON
    const deserializeState = (jsonState) => {
        try {
            const state = typeof jsonState === 'string' ? JSON.parse(jsonState) : jsonState

            // Valida a versão do estado
            if (!state.version) {
                throw new Error('Invalid state format: missing version')
            }

            // Atualiza as dimensões do canvas
            canvasWidth.value = state.canvas.width
            canvasHeight.value = state.canvas.height
            canvasZoom.value = state.canvas.zoom

            // Recria os elementos com novas instâncias
            canvasElements.value = state.elements.map(element => ({
                ...element,
                id: element.id // Mantém o ID original para referências
            }))

            return true
        } catch (error) {
            console.error('Error deserializing editor state:', error)
            return false
        }
    }

    // Salva o estado atual para a API
    const saveToAPI = async (endpoint) => {
        try {
            isSaving.value = true
            const state = serializeState() 

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(state)
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()
            debugLog('State saved successfully:', result)
            return result
        } catch (error) {
            console.error('Error saving editor state:', error)
            throw error
        } finally {
            isSaving.value = false
        }
    }

    // Carrega o estado da API
    const loadFromAPI = async (endpoint) => {
        try {
            isLoading.value = true
            const response = await fetch(endpoint)

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const state = await response.json()
            const success = deserializeState(state)

            if (!success) {
                throw new Error('Failed to deserialize state')
            }

            debugLog('State loaded successfully')
            return true
        } catch (error) {
            console.error('Error loading editor state:', error)
            throw error
        } finally {
            isLoading.value = false
        }
    }

    // Exporta o estado atual para um arquivo JSON
    const exportToFile = () => {
        const state = serializeState()
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = `editor-state-${new Date().toISOString()}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Importa o estado de um arquivo JSON
    const importFromFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const success = deserializeState(e.target.result)
                    if (success) {
                        resolve(true)
                    } else {
                        reject(new Error('Failed to import state'))
                    }
                } catch (error) {
                    reject(error)
                }
            }

            reader.onerror = () => reject(new Error('Error reading file'))
            reader.readAsText(file)
        })
    }

    return {
        isSaving,
        isLoading,
        saveToAPI,
        loadFromAPI,
        exportToFile,
        importFromFile,
        serializeState,
        deserializeState
    }
}