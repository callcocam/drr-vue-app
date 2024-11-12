// components/CanvasControls.vue
<template>
    <div class="canvas-controls">
        <!-- Dimensões -->
        <div class="dimensions-controls">
            <div class="control-group">
                <label>Largura</label>
                <div class="input-with-unit">
                    <input type="number" :value="width" @input="updateWidth" min="1" step="1" />
                    <span>px</span>
                </div>
            </div>

            <div class="control-group">
                <label>Altura</label>
                <div class="input-with-unit">
                    <input type="number" :value="height" @input="updateHeight" min="1" step="1" />
                    <span>px</span>
                </div>
            </div>

            <div class="control-group">
                <label>Zoom</label>
                <div class="input-with-unit">
                    <input type="number" :value="zoom" @input="updateZoom" min="10" max="400" step="10" />
                    <span>%</span>
                </div>
            </div>
        </div>

        <!-- Presets -->
        <div class="presets">
            <button v-for="preset in presets" :key="preset.name" @click="applyPreset(preset)"
                :class="{ active: isCurrentPreset(preset) }">
                {{ preset.name }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    width: {
        type: Number,
        required: true
    },
    height: {
        type: Number,
        required: true
    },
    zoom: {
        type: Number,
        required: true
    }
})

const emit = defineEmits(['update:width', 'update:height', 'update:zoom'])

const presets = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'Facebook Post', width: 1200, height: 630 },
    { name: 'Twitter Post', width: 1200, height: 675 },
    { name: 'A4', width: 2480, height: 3508 }
]

const updateWidth = (event) => {
    const value = parseInt(event.target.value)
    if (value > 0) {
        emit('update:width', value)
    }
}

const updateHeight = (event) => {
    const value = parseInt(event.target.value)
    if (value > 0) {
        emit('update:height', value)
    }
}

const updateZoom = (event) => {
    const value = parseInt(event.target.value)
    if (value >= 10 && value <= 400) {
        emit('update:zoom', value)
    }
}

const applyPreset = (preset) => {
    emit('update:width', preset.width)
    emit('update:height', preset.height)
}

const isCurrentPreset = (preset) => {
    return props.width === preset.width && props.height === preset.height
}
</script>

<style scoped>
.canvas-controls {
    padding: 8px;
    background-color: white;
    border-bottom: 1px solid #e2e8f0;
}

.dimensions-controls {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 8px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.control-group label {
    font-size: 12px;
    color: #4a5568;
}

.input-with-unit {
    display: flex;
    align-items: center;
    gap: 4px;
}

.input-with-unit input {
    width: 80px;
    padding: 4px 8px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    font-size: 14px;
}

.input-with-unit span {
    font-size: 12px;
    color: #4a5568;
}

.presets {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.presets button {
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
    transition: all 0.2s;
}

.presets button:hover {
    background-color: #f7fafc;
}

.presets button.active {
    background-color: #ebf8ff;
    border-color: #4299e1;
    color: #2b6cb0;
}
</style>