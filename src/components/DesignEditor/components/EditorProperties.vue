<script setup>
const props = defineProps({
  element: {
    type: Object,
    default: null
  },
  isGroup: {
    type: Boolean,
    default: false
  },
  availableFonts: {
    type: Array,
    required: true
  },
  fontSizes: {
    type: Array,
    required: true
  },
  borderStyles: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:element', 'removeElement'])

const updateElement = (property, value) => {
  emit('update:element', {
    ...props.element,
    [property]: value
  })
}

const getColorValue = (color) => {
  if (!color || color === 'transparent') return '#ffffff'
  return color
}

const updateColor = (property, value) => {
  const newValue = value === '#ffffff' ? 'transparent' : value
  updateElement(property, newValue)
}

const formatColor = (color) => {
  if (!color || color === 'transparent') return ''
  return color.toUpperCase()
}

const removeBackground = () => {
  updateElement('backgroundColor', 'transparent')
}

const updateBorder = (property, value) => {
  if (property === 'borderColor') {
    const newValue = value === '#ffffff' ? 'transparent' : value
    updateElement(property, newValue)
    // Se a cor da borda está sendo definida, garante que haja uma largura mínima
    if (props.element.borderWidth === 0) {
      updateElement('borderWidth', 1)
    }
  } else {
    updateElement(property, value)
  }
}

const removeBorder = () => {
  emit('update:element', {
    ...props.element,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0
  })
}
</script>
<template>
  <div class="properties-panel">
    <!-- Estado vazio -->
    <div v-if="!element" class="properties-empty-state">
      <div class="empty-state-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z" />
          <path d="M12 7v10" />
          <path d="M8 12h8" />
        </svg>
      </div>
      <h3 class="empty-state-title">Nenhum elemento selecionado</h3>
      <p class="empty-state-description">Selecione um elemento no canvas para editar suas propriedades</p>
    </div>

    <!-- Painel com elemento selecionado -->
    <div v-else class="properties-content">
      <!-- Cabeçalho -->
      <div class="properties-header">
        <h2 class="properties-title">
          {{ isGroup ? 'Grupo' : element.name || 'Elemento' }}
        </h2>
      </div>

      <div class="properties-scroll">
        <!-- Posição e Dimensões -->
        <section class="property-section">
          <h3 class="section-title">Posição e Dimensões</h3>
          <div class="input-grid">
            <div class="input-field">
              <label>X</label>
              <input type="number" :value="element.x" @input="e => updateElement('x', Number(e.target.value))" />
            </div>
            <div class="input-field">
              <label>Y</label>
              <input type="number" :value="element.y" @input="e => updateElement('y', Number(e.target.value))" />
            </div>
            <div class="input-field">
              <label>L</label>
              <input type="number" :value="element.width"
                @input="e => updateElement('width', Number(e.target.value))" />
            </div>
            <div class="input-field">
              <label>A</label>
              <input type="number" :value="element.height"
                @input="e => updateElement('height', Number(e.target.value))" />
            </div>
          </div>
        </section>

        <!-- Transformação -->
        <section class="property-section">
          <h3 class="section-title">Transformação</h3>
          <div class="input-grid">
            <div class="input-field">
              <label>Rotação</label>
              <input type="number" :value="element.rotation"
                @input="e => updateElement('rotation', Number(e.target.value))" />
            </div>
            <div class="input-field">
              <label>Z-Index</label>
              <input type="number" :value="element.zIndex"
                @input="e => updateElement('zIndex', Number(e.target.value))" />
            </div>
          </div>
        </section>

        <!-- Aparência -->
        <section class="property-section">
          <h3 class="section-title">Aparência</h3>

          <!-- Cor de Fundo -->
          <div class="color-field">
            <div class="color-header">
              <label>Cor de Fundo</label>
              <button class="reset-button" @click="removeBackground">Remover</button>
            </div>
            <div class="color-input">
              <input type="color" :value="getColorValue(element.backgroundColor)"
                @input="e => updateColor('backgroundColor', e.target.value)" />
              <input type="text" :value="formatColor(element.backgroundColor)"
                @input="e => updateColor('backgroundColor', e.target.value)" placeholder="Transparente" />
            </div>
          </div>

          <!-- Borda -->
          <div class="border-fields">
            <div class="color-header">
              <label>Borda</label>
              <button class="reset-button" @click="removeBorder">Remover</button>
            </div>
            <div class="color-input">
              <input type="color" :value="getColorValue(element.borderColor)"
                @input="e => updateBorder('borderColor', e.target.value)" />
              <input type="text" :value="formatColor(element.borderColor)"
                @input="e => updateBorder('borderColor', e.target.value)" placeholder="Sem borda" />
            </div>
            <div class="input-field">
              <label>Estilo</label>
              <select :value="element.borderStyle || 'solid'"
                @change="e => updateElement('borderStyle', e.target.value)">
                <option v-for="style in borderStyles" :key="style.value" :value="style.value">
                  {{ style.label }}
                </option>
              </select>
            </div>
            <div class="input-field">
              <label>Espessura</label>
              <input type="number" :value="element.borderWidth"
                @input="e => updateBorder('borderWidth', Math.max(0, Number(e.target.value)))" min="0" max="20" />
            </div>
            <div class="input-field">
              <label>Raio</label>
              <input type="number" :value="element.borderRadius"
                @input="e => updateBorder('borderRadius', Math.max(0, Number(e.target.value)))" min="0" />
            </div>
          </div>
        </section>

        <!-- Propriedades de Texto -->
        <section v-if="element.type === 'text'" class="property-section">
          <h3 class="section-title">Texto</h3>
          <div class="text-fields">
            <div class="color-field">
              <label>Cor do Texto</label>
              <div class="color-input">
                <input type="color" :value="getColorValue(element.textColor)"
                  @input="e => updateColor('textColor', e.target.value)" />
                <input type="text" :value="formatColor(element.textColor)"
                  @input="e => updateColor('textColor', e.target.value)" />
              </div>
            </div>
            <div class="input-field">
              <label>Fonte</label>
              <select :value="element.fontFamily" @change="e => updateElement('fontFamily', e.target.value)">
                <option v-for="font in availableFonts" :key="font.value" :value="font.value">
                  {{ font.label }}
                </option>
              </select>
            </div>
            <div class="input-field">
              <label>Tamanho</label>
              <select :value="element.fontSize" @change="e => updateElement('fontSize', Number(e.target.value))">
                <option v-for="size in fontSizes" :key="size" :value="size">
                  {{ size }}px
                </option>
              </select>
            </div>
            <div class="input-field">
              <label>Altura da Linha Personalizada</label>
              <div class="number-with-unit">
                <input type="number" :value="element.lineHeight"
                  @input="e => updateElement('lineHeight', e.target.value)" min="0.5" max="3" step="0.1"
                  class="number-input" />
                <span class="unit">×</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Botão Remover -->
        <section class="property-section">
          <button @click="$emit('removeElement')" class="remove-button">
            Remover
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.properties-panel {
  width: 280px;
  height: 100%;
  border-left: 1px solid #e2e8f0;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.properties-empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: #94a3b8;
}

.empty-state-icon {
  margin-bottom: 16px;
  color: #cbd5e1;
}

.empty-state-title {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: #94a3b8;
}

.properties-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.properties-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.properties-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.properties-scroll {
  flex: 1;
  overflow-y: auto;
}

.property-section {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin: 0 0 8px 0;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.input-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.input-field label {
  font-size: 11px;
  color: #64748b;
}

.input-field input,
.input-field select {
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  width: 100%;
}

.color-field {
  margin-bottom: 8px;
}

.color-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.color-header label {
  font-size: 11px;
  color: #64748b;
}

.reset-button {
  font-size: 11px;
  color: #3b82f6;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.color-input {
  display: flex;
  gap: 8px;
}

.color-input input[type="color"] {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.color-input input[type="text"] {
  flex: 1;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
}

.border-fields,
.text-fields {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.remove-button {
  width: 100%;
  padding: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-button:hover {
  background: #dc2626;
}

/* Estilização da barra de rolagem vertical */
.properties-scroll::-webkit-scrollbar {
  width: 6px;
}

.properties-scroll::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.properties-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.properties-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Estilização do color picker */
input[type="color"] {
  -webkit-appearance: none;
  padding: 0;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

input[type="color"]::-moz-color-swatch {
  border: none;
  border-radius: 3px;
}
</style>