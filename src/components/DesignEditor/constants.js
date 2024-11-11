// src/components/DesignEditor/config/constants.js
export const AVAILABLE_ELEMENTS = [
    { type: 'rectangle', label: 'Retângulo' },
    { type: 'circle', label: 'Círculo' },
    { type: 'text', label: 'Texto' }
]

export const AVAILABLE_FONTS = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Helvetica', label: 'Helvetica' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Verdana', label: 'Verdana' },
    { value: 'Courier New', label: 'Courier New' }
]

export const FONT_SIZES = [
    8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72
]

export const ELEMENT_DEFAULTS = {
    width: 100,
    height: 100,
    rotation: 0,
    backgroundColor: '#EEEEEE',
    borderColor: '#000000',
    borderWidth: 1,
    textColor: '#000000',
    fontSize: 16,
    fontFamily: 'Arial',
    text: ''
}