import EmojiConvertor from 'emoji-js'

const emoji = new EmojiConvertor()
emoji.img_sets.apple.path = '/64/'
emoji.replace_mode = 'native'
emoji.supports_css = false
emoji.include_title = true
emoji.init_unified()
emoji.init_colons()

export default emoji
