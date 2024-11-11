<script setup>
const props = defineProps({
  element: {
    type: Object,
    required: true
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
  <div class="w-72 bg-white shadow-lg border-l divide-y overflow-y-auto">
    <!-- Cabeçalho -->
    <div class="p-4">
      <h2 class="font-semibold text-gray-800">
        {{ isGroup ? 'Grupo' : element.type === 'text' ? 'Texto' : element.type }}
      </h2>
    </div>

    <!-- Posição e Dimensões -->
    <div class="p-4 space-y-4">
      <h3 class="font-medium text-sm text-gray-600">Posição e Dimensões</h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-500 mb-1">X</label>
          <input type="number" :value="element.x" @input="e => updateElement('x', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Y</label>
          <input type="number" :value="element.y" @input="e => updateElement('y', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Largura</label>
          <input type="number" :value="element.width" @input="e => updateElement('width', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Altura</label>
          <input type="number" :value="element.height" @input="e => updateElement('height', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Transformação -->
    <div class="p-4 space-y-4">
      <h3 class="font-medium text-sm text-gray-600">Transformação</h3>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Rotação</label>
          <input type="number" :value="element.rotation" @input="e => updateElement('rotation', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-xs text-gray-500 mb-1">Z-Index</label>
          <input type="number" :value="element.zIndex" @input="e => updateElement('zIndex', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Aparência -->
    <div class="p-4 space-y-4">
      <h3 class="font-medium text-sm text-gray-600">Aparência</h3>

      <!-- Cor de Fundo -->
      <div class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-xs text-gray-500">Cor de Fundo</label>
          <button class="text-xs text-blue-500 hover:text-blue-600 transition-colors" @click="removeBackground">
            Remover Fundo
          </button>
        </div>
        <div class="flex gap-2">
          <input type="color" :value="getColorValue(element.backgroundColor)"
            @input="e => updateColor('backgroundColor', e.target.value)" class="w-8 h-8 rounded border p-0" />
          <input type="text" :value="formatColor(element.backgroundColor)"
            @input="e => updateColor('backgroundColor', e.target.value)" placeholder="Transparente"
            class="flex-1 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
        </div>
      </div>

      <!-- Borda -->
      <div class="space-y-3">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-xs text-gray-500">Borda</label>
            <button class="text-xs text-blue-500 hover:text-blue-600 transition-colors" @click="removeBorder">
              Remover Borda
            </button>
          </div>
          <div class="flex gap-2">
            <input type="color" :value="getColorValue(element.borderColor)"
              @input="e => updateBorder('borderColor', e.target.value)" class="w-8 h-8 rounded border p-0" />
            <input type="text" :value="formatColor(element.borderColor)"
              @input="e => updateBorder('borderColor', e.target.value)" placeholder="Sem borda"
              class="flex-1 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
        </div>

        <!-- Tipo de Borda -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Tipo de Borda</label>
          <select :value="element.borderStyle || 'solid'" @change="e => updateElement('borderStyle', e.target.value)"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none">
            <option v-for="style in borderStyles" :key="style.value" :value="style.value">
              {{ style.label }}
            </option>
          </select>
        </div>

        <!-- Espessura da Borda -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Espessura da Borda</label>
          <input type="number" :value="element.borderWidth"
            @input="e => updateBorder('borderWidth', Math.max(0, Number(e.target.value)))" min="0" max="20"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <!-- Arredondamento da Borda -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Arredondamento</label>
          <input type="number" :value="element.borderRadius"
            @input="e => updateBorder('borderRadius', Math.max(0, Number(e.target.value)))" min="0"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Propriedades de Texto -->
    <div v-if="element.type === 'text'" class="p-4 space-y-4">
      <h3 class="font-medium text-sm text-gray-600">Texto</h3>
      <div class="space-y-3">
        <!-- Cor do Texto -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Cor do Texto</label>
          <div class="flex gap-2">
            <input type="color" :value="getColorValue(element.textColor)"
              @input="e => updateColor('textColor', e.target.value)" class="w-8 h-8 rounded border p-0" />
            <input type="text" :value="formatColor(element.textColor)"
              @input="e => updateColor('textColor', e.target.value)"
              class="flex-1 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
        </div>

        <!-- Fonte -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Fonte</label>
          <select :value="element.fontFamily" @change="e => updateElement('fontFamily', e.target.value)"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none">
            <option v-for="font in availableFonts" :key="font.value" :value="font.value"
              :style="{ fontFamily: font.value }">
              {{ font.label }}
            </option>
          </select>
        </div>

        <!-- Tamanho da Fonte -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Tamanho da Fonte</label>
          <select :value="element.fontSize" @change="e => updateElement('fontSize', Number(e.target.value))"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none">
            <option v-for="size in fontSizes" :key="size" :value="size">
              {{ size }}px
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Botão Remover -->
    <div class="p-4">
      <button @click="$emit('removeElement')"
        class="w-full py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200">
        Remover
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type="color"] {
  -webkit-appearance: none;
  padding: 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

/* Firefox */
input[type="color"]::-moz-color-swatch {
  border: none;
  border-radius: 3px;
}
</style>