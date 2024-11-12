// composables/useElementInteraction.js
import { ref } from 'vue'

export function useElementInteraction() {


    // Função para gerar estilos do elemento
    const getElementStyle = (element) => {
        return {
            position: 'absolute',
            left: `${element.x}px`,
            top: `${element.y}px`,
            width: `${element.width}px`,
            height: `${element.height}px`,
            transform: `rotate(${element.rotation || 0}deg)`,
            backgroundColor: element.backgroundColor,
            borderStyle: element.borderStyle || 'solid',
            borderWidth: element.borderWidth ? `${element.borderWidth}px` : '0',
            borderColor: element.borderColor || 'transparent',
            borderRadius: element.borderRadius ? `${element.borderRadius}px` : '0',
            zIndex: element.zIndex,
            lineHeight: element.lineHeight,
        }
    }

    return {
        getElementStyle
    }
}