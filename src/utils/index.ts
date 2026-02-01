import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

/**
 * 格式化文件大小
 * @param size
 */
export const formatSize = (size?: number) => {
  if (!size) return '未知'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

/**
 * 下载图片
 * @param url 图片下载地址
 * @param fileName 要保存为的文件名
 */
export function downloadImage(url?: string, fileName?: string) {
  if (!url) {
    return
  }
  saveAs(url, fileName)
}

/**
 * 将颜色值转换为标准 #RRGGBB 格式
 * @param input
 */
export function toHexColor(input: string) {
  if (!input) return '#1890ff'
  // 去掉 0x 前缀
  const colorValue = input.startsWith('0x') ? input.slice(2) : input
  // 将剩余部分解析为十六进制数，再转成 6 位十六进制字符串
  const hexColor = parseInt(colorValue, 16).toString(16).padStart(6, '0')
  // 返回标准 #RRGGBB 格式
  return `#${hexColor}`
}

/**
 * 格式化日期时间
 * @param date
 * @param format 默认 YYYY-MM-DD HH:mm:ss
 */
export const formatDate = (date?: string | number | Date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return ''
  return dayjs(date).format(format)
}

/**
 * 根据标签内容获取预设颜色 (用于广场标签展示)
 * @param tag
 */
export const getTagColor = (tag: string) => {
  const colorMap: Record<string, string> = {
    Java: 'orange',
    Spring: 'green',
    'Vue': 'cyan',
    'Python': 'blue',
    '生活': 'pink',
    '面试': 'red',
    '春招': 'purple',
  }
  return colorMap[tag] || 'blue'
}
