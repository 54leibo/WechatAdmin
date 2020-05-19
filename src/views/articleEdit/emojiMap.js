const Constant = require('./emojiConstant')
const CATEGORY = Constant.CATEGORY

export const categoryDataMap = {
  'Activities': CATEGORY.ACTIVITY,
  'Flags': CATEGORY.FLAGS,
  'Food & Drink': CATEGORY.FOODS,
  'Animals & Nature': CATEGORY.NATURE,
  'Objects': CATEGORY.OBJECTS,
  'Smileys & People': CATEGORY.PEOPLE,
  'Travel & Places': CATEGORY.PLACES,
  'Symbols': CATEGORY.SYMBOLS
}

export const categoryNameMap = {
  [CATEGORY.ACTIVITY]: 'ACTIVITY',
  [CATEGORY.FLAGS]: 'FLAGS',
  [CATEGORY.FOODS]: 'FOOD & DRINK',
  [CATEGORY.NATURE]: 'ANIMALS & NATURE',
  [CATEGORY.OBJECTS]: 'OBJECTS',
  [CATEGORY.PEOPLE]: 'SMILEYS & PEOPLE',
  [CATEGORY.PLACES]: 'TRAVEL & PLACES',
  [CATEGORY.SYMBOLS]: 'SYMBOLS'
}

export const categoryShortNameMap = {
  [CATEGORY.ACTIVITY]: '⚽',
  [CATEGORY.FLAGS]: '🎌',
  [CATEGORY.FOODS]: '🍔',
  [CATEGORY.NATURE]: '🐻',
  [CATEGORY.OBJECTS]: '💡',
  [CATEGORY.PEOPLE]: '😃',
  [CATEGORY.PLACES]: '🌇',
  [CATEGORY.SYMBOLS]: '🔣'
}

export const sizeMap = {
  '0': 16,
  '1': 20,
  '2': 32,
  '4': 64
}
