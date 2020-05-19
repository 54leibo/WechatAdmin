/**
 * Created by PanJiaChen on 16/11/18.
 */

import emoji from '../views/articleEdit/emoji'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0) {
    return null
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * @arr: {Array} 操作数组
 * @startPos: {Number} 需要移动数据开始项
 * @length: {Number} 需要移动数据项数
 * @moveSteps: {Number} 需要移动位数, positive number move right, minus number move left
 * @return {Array}
 * */
export function moveArrayItem(arr, startPos, length, moveSteps) {
  if (!(arr instanceof Array)) {
    throw new Error(`arr can only be: Array, got:${Object.prototype.toString.call(arr)}`)
  }
  if (typeof startPos !== 'number') {
    if (startPos < 0) {
      throw new Error(`startPos can only be: positive integer, got:${startPos}`)
    }
    if (startPos.toString().indexOf('.') !== -1) {
      throw new Error(`startPos can only be: positive integer, got:${startPos}`)
    }

    throw new Error(`startPos can only be: Number, got:${startPos}`)
  }
  if (typeof length !== 'number') {
    if (length < 0) {
      throw new Error(`length can only be: positive integer, got:${length}`)
    }
    if (length.toString().indexOf('.') !== -1) {
      throw new Error(`startPos can only be: positive integer, got:${length}`)
    }

    throw new Error(`length can only be: Number, got:${length}`)
  }
  if (typeof moveSteps !== 'number') {
    throw new Error(`moveSteps can only be: Number, got:${length}`)
  }
  const originArrLen = arr.length
  const moveItems = arr.splice(startPos, length) || []

  if (moveSteps < 0) {
    moveSteps = Math.abs(moveSteps)
    arr.splice(startPos - moveSteps >= 0 ? startPos - moveSteps : 0, 0, ...moveItems)
  } else {
    arr.splice(startPos + moveSteps <= originArrLen - 1 ? startPos + moveSteps : originArrLen - 1, 0, ...moveItems)
  }

  return arr
}

/**
 * 深度递归搜索
 * @param {Array} arr 你要搜索的数组
 * @param {Function} condition 回调函数，必须返回谓词，判断是否找到了。会传入item参数
 * @param {String} children 子数组的key
 */
export function deepFind(arr, condition, children) {
  // 即将返回的数组
  const main = []

    // 开始轮询
  ;(function poll(arr) {
    // 如果传入非数组
    if (!Array.isArray(arr)) return

    // 遍历数组
    for (let i = 0; i < arr.length; i++) {
      // 获取当前项
      const item = arr[i]

      // 检验是否已经找到了
      const isFind = condition && condition(item) || false

      // 如果已经找到了
      if (isFind) {
        main.push(item)

        // 如果存在children，那么深入递归
      } else if (children && item[children] && item[children].length) {
        poll(item[children])
      }
    }
  })(arr, 0)

  // 返回最终数组
  return main
}

export function replaceColonsToUnifed(str) {
  return str.replace(emoji.rx_colons, m => {
    const name = m.substr(1, m.length - 2)
    const code = emoji.map.colons[name]
    if (code) {
      return emoji.data[code][0][0]
    }

    return m
  })
}

export function processEmojiForSave(content) {
  const reg1 = /<img src="\/64\/[-0-9a-f]+\.png" alt="([-a-z]+)" data-w-e="[0-9]+">/g
  const reg2 = /<img src="\/64\/[-0-9a-f]+\.png" class="emoji" data-codepoints="[-0-9a-f]+" title="([-a-z]+)">/g
  return replaceColonsToUnifed(content.replace(reg1, ':$1:').replace(reg2, ':$1:'))
}

export function processEmojiForDisplay(content) {
  return emoji.replace_unified(content)
}
