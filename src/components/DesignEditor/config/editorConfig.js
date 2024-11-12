// src/components/DesignEditor/config/editorConfig.js

export const EDITOR_CONFIG = {
    AVAILABLE_ELEMENTS: [
        { type: 'rectangle', label: 'Retângulo', name: 'RectangleElement' },
        { type: 'circle', label: 'Círculo', name: 'CircleElement' },
        { type: 'text', label: 'Texto', name: 'TextElement' }
    ],

    AVAILABLE_FONTS: [
        { value: 'Arial', label: 'Arial' },
        { value: 'Times New Roman', label: 'Times New Roman' },
        { value: 'Helvetica', label: 'Helvetica' },
        { value: 'Georgia', label: 'Georgia' },
        { value: 'Verdana', label: 'Verdana' },
        { value: 'Courier New', label: 'Courier New' }
    ],

    FONT_SIZES: [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72],

    BORDER_STYLES: [
        { value: 'solid', label: 'Sólida' },
        { value: 'dashed', label: 'Tracejada' },
        { value: 'dotted', label: 'Pontilhada' },
        { value: 'double', label: 'Dupla' }
    ],

    KEYBOARD_SHORTCUTS: {
        MOVEMENT: {
            NORMAL_STEP: 1,
            FAST_STEP: 10
        },

        COMMANDS: {
            COPY: ['ctrl+c', 'cmd+c'],
            PASTE: ['ctrl+v', 'cmd+v'],
            CUT: ['ctrl+x', 'cmd+x'],
            UNDO: ['ctrl+z', 'cmd+z'],
            REDO: ['ctrl+shift+z', 'ctrl+y', 'cmd+shift+z', 'cmd+y'],
            SELECT_ALL: ['ctrl+a', 'cmd+a'],
            DUPLICATE: ['ctrl+d', 'cmd+d'],
            DELETE: ['delete', 'backspace']
        }
    }
}

export const ELEMENT_DEFAULTS = {
    rectangle: {
        width: 100,
        height: 100,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
    },
    circle: {
        radius: 50,
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 1
    },
    text: {
        text: 'Digite aqui',
        fontSize: 16,
        fontFamily: 'Arial',
        fill: '#000000'
    }
}