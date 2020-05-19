import emojiData from 'emoji-datasource'
import { categoryDataMap } from './emojiMap'

const sortedEmojiData = emojiData
  .map((emoji, index) => Object.assign(emoji, { index }))
  .sort((emojiA, emojiB) => emojiA['sort_order'] - emojiB['sort_order'])
  .reduce((obj, emoji) => {
    const category = categoryDataMap[emoji.category]
    const categoryArray = obj[category] || []
    return Object.assign(obj, {
      [category]: categoryArray.concat(emoji)
    })
  }, {})

export default sortedEmojiData
