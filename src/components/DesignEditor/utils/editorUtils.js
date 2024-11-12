// src/components/DesignEditor/utils/editorUtils.js

export const calculateBounds = (elements) => {
    if (!elements?.length) return null

    return elements.reduce((bounds, element) => {
        if (!bounds) {
            return {
                left: element.x,
                top: element.y,
                right: element.x + (element.width || 0),
                bottom: element.y + (element.height || 0)
            }
        }

        return {
            left: Math.min(bounds.left, element.x),
            top: Math.min(bounds.top, element.y),
            right: Math.max(bounds.right, element.x + (element.width || 0)),
            bottom: Math.max(bounds.bottom, element.y + (element.height || 0))
        }
    }, null)
}

export const snapToGrid = (value, gridSize = 10) => {
    return Math.round(value / gridSize) * gridSize
}

export const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max)
}

export const calculateCenter = (element) => {
    return {
        x: element.x + (element.width || 0) / 2,
        y: element.y + (element.height || 0) / 2
    }
}

export const calculateDistance = (point1, point2) => {
    const dx = point2.x - point1.x
    const dy = point2.y - point1.y
    return Math.sqrt(dx * dx + dy * dy)
}

export const calculateAngle = (center, point) => {
    return Math.atan2(point.y - center.y, point.x - center.x) * (180 / Math.PI)
}

export const generateUniqueId = (prefix = 'element') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const deepCloneElement = (element) => {
    return JSON.parse(JSON.stringify(element))
}

export const isPointInBounds = (point, bounds) => {
    return point.x >= bounds.left &&
        point.x <= bounds.right &&
        point.y >= bounds.top &&
        point.y <= bounds.bottom
}

export const calculateRotatedBounds = (element) => {
    const { x, y, width, height, rotation = 0 } = element
    const center = calculateCenter(element)

    // Pontos do retângulo antes da rotação
    const points = [
        { x, y },
        { x: x + width, y },
        { x: x + width, y: y + height },
        { x, y: y + height }
    ]

    // Rotacionar cada ponto
    const rotatedPoints = points.map(point => {
        const dx = point.x - center.x
        const dy = point.y - center.y
        const angle = rotation * (Math.PI / 180)
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        return {
            x: center.x + (dx * cos - dy * sin),
            y: center.y + (dx * sin + dy * cos)
        }
    })

    // Calcular os limites do retângulo rotacionado
    return rotatedPoints.reduce((bounds, point) => ({
        left: Math.min(bounds.left, point.x),
        top: Math.min(bounds.top, point.y),
        right: Math.max(bounds.right, point.x),
        bottom: Math.max(bounds.bottom, point.y)
    }), {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity
    })
}

export const formatValue = (value, unit = 'px') => {
    if (typeof value === 'number') {
        return `${value}${unit}`
    }
    return value
}