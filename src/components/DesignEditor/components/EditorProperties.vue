// src/components/DesignEditor/components/EditorProperties.vue
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
  }
})

const emit = defineEmits(['update:element', 'removeElement'])

const updateElement = (property, value) => {
  emit('update:element', {
    ...props.element,
    [property]: value
  })
}

const removeBackground = () => {
  const updatedElement = { ...props.element }
  updatedElement.backgroundColor = 'transparent'
  emit('update:element', updatedElement)
}

const removeBorder = () => {
  const updatedElement = { ...props.element }
  updatedElement.borderColor = 'transparent'
  updatedElement.borderWidth = 0
  emit('update:element', updatedElement)
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
          <input type="color" :value="element.backgroundColor === 'transparent' ? '#FFFFFF' : element.backgroundColor"
            @input="e => updateElement('backgroundColor', e.target.value)" class="w-8 h-8 rounded border p-0" />
          <input type="text" :value="element.backgroundColor === 'transparent' ? '' : element.backgroundColor"
            @input="e => updateElement('backgroundColor', e.target.value)" placeholder="Transparente"
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
            <input type="color" :value="element.borderColor === 'transparent' ? '#000000' : element.borderColor"
              @input="e => updateElement('borderColor', e.target.value)" class="w-8 h-8 rounded border p-0" />
            <input type="text" :value="element.borderColor === 'transparent' ? '' : element.borderColor"
              @input="e => updateElement('borderColor', e.target.value)" placeholder="Sem borda"
              class="flex-1 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
        </div>

        <!-- Espessura da Borda -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Espessura da Borda</label>
          <input type="number" :value="element.borderWidth"
            @input="e => updateElement('borderWidth', Number(e.target.value))" min="0" max="20"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <!-- Arredondamento da Borda -->
        <div>
          <label class="block text-xs text-gray-500 mb-1">Arredondamento</label>
          <input type="number" :value="element.borderRadius"
            @input="e => updateElement('borderRadius', Number(e.target.value))" min="0"
            class="w-full px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
      </div>
    </div>

    <!-- Propriedades de Texto -->
    <div v-if="element.type === 'text'" class="p-4 space-y-4">
      <h3 class="font-medium text-sm text-gray-600">Texto</h3>
      <div class="space-y-3">
        <div>
          <label class="block text-xs text-gray-500 mb-1">Cor do Texto</label>
          <div class="flex gap-2">
            <input type="color" :value="element.textColor" @input="e => updateElement('textColor', e.target.value)"
              class="w-8 h-8 rounded border p-0" />
            <input type="text" :value="element.textColor" @input="e => updateElement('textColor', e.target.value)"
              class="flex-1 px-2 py-1 rounded border focus:ring-2 focus:ring-blue-500 outline-none uppercase" />
          </div>
        </div>

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
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type="color"]::-webkit-color-swatch-wrapper {
  padding: 0;
}

input[type="color"]::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}
</style>