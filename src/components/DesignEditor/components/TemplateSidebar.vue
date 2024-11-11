<!-- components/DesignEditor/components/TemplateSidebar.vue -->
<script setup>
import { useTemplates } from '@/components/DesignEditor/composables/useTemplates'

const { templates } = useTemplates()

const emit = defineEmits(['template-drag-start', 'template-drag-end'])

const handleDragStart = (event, template) => {
    emit('template-drag-start', {
        event,
        template: {
            ...template,
            width: template.width || 300,
            height: template.height || 400
        }
    })
}

const handleDragEnd = (event) => {
    emit('template-drag-end', event)
}
</script>

<template>
    <div class="w-64 bg-white border-r overflow-y-auto">
        <div class="p-4">
            <h2 class="font-semibold text-gray-800">Templates</h2>
        </div>
        <div class="divide-y">
            <div v-for="template in templates" :key="template.id" class="p-4 hover:bg-gray-50 cursor-move"
                draggable="true" @dragstart="e => handleDragStart(e, template)" @dragend="handleDragEnd">
                <div class="w-full aspect-video bg-gray-100 rounded mb-2 overflow-hidden">
                    <div class="scale-[0.3] origin-top-left w-[300px] h-[400px]" v-html="template.template" />
                </div>
                <p class="text-sm text-gray-600">{{ template.label }}</p>
            </div>
        </div>
    </div>
</template>