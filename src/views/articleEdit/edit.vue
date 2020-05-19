<template>
  <div class="create-group-message-edit">
    <div ref="editorToolbar" class="editor-toolbar"></div>
    <div class="editor-menu-wrap">
      <div class="editor-menu">
        <div class="avatar">
          <el-avatar size="small"
                     src="../../assets/logo.png"></el-avatar>
          <span class="name">一个表情包</span>
        </div>
        <div class="article-list">
          <div v-for="(item, index) in articles.list" :key="item.id" class="article-item"
               :class="{active: item.id === articles.activeItem.id, desktop: index === 0}"
               @click="changeActiveArticle(item)">
            <div class="article-item-title">{{ item.title }}</div>
            <el-image :src="item.coverSrc"
                      :style="{visibility: item.coverSrc ? 'visible' : 'hidden'}"
                      class="article-item-img"
                      fit="cover"/>
            <div class="article-item-operation">
              <el-popover width="130" trigger="click" :visible-arrow="false" placement="right-start">
                <el-dropdown-item v-for="(typeItem, type) in articles.types"
                                  :key="type"
                                  :icon="typeItem.icon"
                                  @click.native.stop="handleAddArticle(type, true)"
                >{{ typeItem.text }}
                </el-dropdown-item>
                <el-tooltip v-if="index === 0" slot="reference" content="替换" placement="left">
                  <i class="operation-item el-icon-sort"></i>
                </el-tooltip>
              </el-popover>
              <el-tooltip v-if="index > 0" content="上移" placement="left">
                <i class="operation-item el-icon-arrow-up" @click="moveUpArticle(index)"></i>
              </el-tooltip>
              <el-tooltip v-if="index < articles.list.length - 1" content="下移" placement="left">
                <i class="operation-item el-icon-arrow-down"
                   @click="moveDownArticle(index)"></i>
              </el-tooltip>
              <el-tooltip v-if="index > 0" content="删除" placement="left">
                <i class="operation-item el-icon-delete" @click.stop="delArticle(index)"></i>
              </el-tooltip>
            </div>
          </div>
        </div>
        <div v-if="articles.list.length < 8" class="create-article">
          <el-dropdown @command="type => handleAddArticle(type, false)">
            <span class="el-dropdown-link">
              <i class="el-icon-plus">新建消息</i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="(item, type) in articles.types"
                                :key="type"
                                :command="type"
                                :icon="item.icon"
              >{{ item.text }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
    <div class="editor-wrap">
      <!--<div class="draft-hint-wrap">-->
      <!--<div class="draft-hint">-->
      <!--你有草稿未编辑-->
      <!--<i class="el-icon-warning"></i>-->
      <!--</div>-->
      <!--</div>-->
      <div v-show="articles.activeItem.type === 'graphic' || articles.activeItem.type === 'selectGraphic'"
           class="editor-panel">
        <el-input v-model="articles.activeItem.title" class="title" placeholder="请在这里输入标题" minlenght="1"
                  maxlength="64"
                  show-word-limit
        />
        <el-input v-model="articles.activeItem.author" class="author" placeholder="请输入作者" minlenght="1" maxlength="8"
                  show-word-limit
        />
        <div ref="editor" class="editor"></div>
        <div class="cover-digest">
          <div class="title">封面和摘要</div>
          <div class="content">
            <div class="cover">
              <el-popover placement="bottom" trigger="hover">
                <div slot="reference">
                  <i v-if="!articles.activeItem.coverSrc" slot="reference" class="el-icon-plus"></i>
                  <el-image v-else class="el-icon-img" fit="fill" :src="articles.activeItem.coverSrc"/>
                </div>
                <div>
                  <el-button type="text" @click="onSelectCoverFromContent">从正文选择</el-button>
                  <el-button type="text" @click="cover.chooseFromMaterialDialogShow = true">从图片库选择</el-button>
                </div>
              </el-popover>
            </div>
            <div class="digest">
              <el-input
                v-model="articles.activeItem.digest"
                class="textarea"
                type="textarea"
                placeholder="请输入内容"
                maxlength="120"
                show-word-limit
                rows="4"
              />
            </div>
          </div>
        </div>
        <div class="leave-word">
          <el-checkbox v-model="articles.activeItem.leaveWord.checked" @change="onLeaveWordCheckboxChange"/>
          <el-popover
            class="popover"
            placement="top-start"
            title="标题"
            width="200"
          >
            <div ref="leaveWord" slot="reference" @click="clickLeaveWord">留言 >
              <span v-if="articles.activeItem.leaveWord.checked" class="leave-word-selected-sub-item">
                {{ articles.leaveTypes[articles.activeItem.leaveWord.subCheckedItem] }}
              </span>
            </div>
            <div>
              <el-radio v-for="(item, key) in articles.leaveTypes" :key="key"
                        v-model="articles.activeItem.leaveWord.subCheckedItem"
                        :label="Number(key)"
                        class="leave-word-radio"
              >
                {{ item }}
              </el-radio>
            </div>
          </el-popover>
        </div>
        <div class="tool-bar">
          <div class="left">
            正文字数&nbsp; {{ editor.wordNum }}
          </div>
          <div class="right">
            <el-button type="primary" size="small" @click="save">保存</el-button>
            <el-button size="small" @click="preview">预览</el-button>
            <el-button size="small" @click="saveTranspond">保存并群发</el-button>
          </div>
        </div>
      </div>
      <!--<div v-show="articles.activeItem.type === 'selectPicture'" class="picture-panel">-->
      <!--<el-input-->
      <!--v-model="articles.activeItem.digest"-->
      <!--class="textarea"-->
      <!--type="textarea"-->
      <!--placeholder="可以输入140字以内的推荐语(选填)"-->
      <!--maxlength="120"-->
      <!--show-word-limit-->
      <!--rows="4"-->
      <!--/>-->
      <!--<div class="picture-drag">-->
      <!--<draggable-->
      <!--tag="span"-->
      <!--v-bind="pictureDrag.options"-->
      <!--&gt;-->
      <!--<transition-group type="transition">-->
      <!--<el-image v-for="(url, index) in articles.activeItem.imgs"-->
      <!--:key="`${url}${index}`"-->
      <!--fit="cover"-->
      <!--class="picture-drag-item"-->
      <!--:src="url" />-->
      <!--</transition-group>-->
      <!--</draggable>-->
      <!--<div @click="selectPicture.dialog.visible = true" class="picture-drag-add">-->
      <!--<i class="el-icon-plus"></i>-->
      <!--</div>-->
      <!--</div>-->
      <!--<div class="cover-digest">-->
      <!--<div class="title">封面和摘要</div>-->
      <!--</div>-->
      <!--<div class="leave-word">-->
      <!--<el-checkbox v-model="articles.activeItem.leaveWord.checked" />-->
      <!--<el-popover-->
      <!--class="popover"-->
      <!--placement="top-start"-->
      <!--title="标题"-->
      <!--width="200"-->
      <!--&gt;-->
      <!--<div ref="leaveWord" slot="reference" @click="clickLeaveWord">留言 >-->
      <!--<span v-if="articles.activeItem.leaveWord.checked" class="leave-word-selected-sub-item">-->
      <!--{{ articles.leaveTypes[articles.activeItem.leaveWord.subCheckedItem] }}-->
      <!--</span>-->
      <!--</div>-->
      <!--<div>-->
      <!--<el-radio v-for="(item, key) in articles.leaveTypes" :key="key"-->
      <!--v-model="articles.activeItem.leaveWord.subCheckedItem"-->
      <!--:label="key"-->
      <!--class="leave-word-radio"-->
      <!--&gt;-->
      <!--{{ item }}-->
      <!--</el-radio>-->
      <!--</div>-->
      <!--</el-popover>-->
      <!--</div>-->
      <!--</div>-->
    </div>

    <select-article v-model="chooseMsgDialog.show" @select="onSelectGraphicConfirm"></select-article>

    <select-picture v-model="chooseImgDialog.show" :is-single="false"
                    @confirm="onSelectPictureFromMaterialConfirm"></select-picture>

    <select-picture v-model="cover.chooseFromMaterialDialogShow"
                    @confirm="onSelectCoverFromMaterialConfirm"></select-picture>

    <el-dialog
      class="dialog"
      title="选择图片"
      :visible.sync="cover.chooseFromContentDialogShow"
      width="60%"
    >
      <div v-for="(src, index) in cover.imgList" :key="index" class="img-wrap el-icon-check"
           :class="{checked: cover.checkedImg === src}"
           @click="selectPictureFromMaterial(src)"
      >
        <el-image :src="src" style="width: 100%; height: 100%" fit="cover"/>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="onSelectCoverFromContentConfirm">确定</el-button>
      </div>
    </el-dialog>

    <send-preview v-model="previewDialogVisible"></send-preview>

    <el-backtop target=".editor-wrap"/>
  </div>
</template>

<script>
import { moveArrayItem, deepFind } from '@/utils/index'
import emoji from './emoji'
// import Draggable from 'vuedraggable'
import { categoryShortNameMap } from './emojiMap'
import categoryOrder from './emojiCategoryOrder'
import sortedEmojiData from './emojiCategoryData'
import SelectArticle from '@/components/SelectArticle'
import SelectPicture from '@/components/SelectPicture'
import SendPreview from '@/components/SendPreview'

import articleListItem from '../../mock/article/articleListItem'

const getArticleDraft = async () => {
  return [{
    ...articleListItem,
    head: require('../../assets/logo.png')
  }]
}
const saveArticleDraft = async () => ({})
const getMsgDetailById = async () => {
  const list = []

  for (let i = 0; i < 8; i++) {
    list.push({
      ...articleListItem,
      id: `id_${i}`,
      head: require('../../assets/logo.png')
    })
  }

  return list
}
const uploadContentPicture = async () => ({})

import E from '../../lib/wangEditor'
import '../../styles/wangeditor.scss'

export default {
  name: 'CreateGroupMessageEdit',
  components: {
    SelectArticle,
    SendPreview,
    SelectPicture
  },
  data() {
    return {
      articles: {
        types: {
          graphic: {
            text: '图文消息',
            icon: 'el-icon-edit',
            switchTip: '写新图文消息，当前内容不会保存。'
          },
          selectGraphic: {
            text: '选择图文',
            icon: 'el-icon-tickets',
            switchTip: '选择其他图文消息，当前内容不会保存。'
          }
          // selectPicture: {
          //   text: '图片消息',
          //   icon: 'el-icon-picture-outline',
          //   switchTip: '替换为图片消息，当前内容不会保存。'
          // }
        },
        list: [],
        activeItem: {
          type: 'graphic',
          coverSrc: '',
          imgs: [],
          title: '',
          content: '',
          digest: '',
          leaveWord: {
            checked: true,
            subCheckedItem: 1
          }
        },
        leaveTypes: {
          1: '所有人均可留言',
          2: '仅关注后可留言'
        }
      },
      chooseMsgDialog: {
        show: false,
        isForFist: false // choose for first article
      },
      chooseImgDialog: {
        show: false
      },
      previewDialogVisible: false,
      cover: {
        chooseFromMaterialDialogShow: false,
        chooseFromContentDialogShow: false,
        imgList: [],
        checkedImg: ''
      },
      pictureDrag: {
        options: {
          animation: 200,
          group: 'description',
          disabled: false
        }
      },
      editor: {
        ins: null,
        wordNum: 0,
        uploadFiles: [],
        fileIndex: 1
      }
    }
  },
  watch: {
    'leaveWord.checked'(newVal) {
      if (!newVal) {
        return
      }
      this.$refs.leaveWord.click()
    }
  },
  created() {
    this.init()
  },
  mounted() {
    this.initEditor()
  },
  methods: {
    init() {
      const msgId = this.$route.query.msgId
      const callback = (res) => {
        // 目前只有图文
        this.articles.list = res.map(article => {
          const isLeaveable = article.leaveMessageStatus !== 0
          return Object.assign(this.generateArticleData({ type: 'graphic' }), {
            id: article.id,
            title: article.title,
            content: article.content,
            digest: article.description,
            author: article.author,
            coverSrc: article.head,
            leaveWord: {
              checked: isLeaveable,
              subCheckedItem: article.leaveMessageStatus
            }
          })
        })
        this.changeActiveArticle(this.articles.list[0])
      }
      if (this.$route.query.isEdit) { // edit new msg base on draft
        getArticleDraft()
          .then(callback)
      } else if (msgId) { // edit new msg base on old msg
        getMsgDetailById(msgId)
          .then(callback)
      } else {
        const newArticle = this.generateArticleData({ type: 'graphic' })
        this.articles.list.push(newArticle)
        this.articles.activeItem = newArticle
      }
    },
    generateArticleData(extendOptions) {
      const id = Date.now() + this.articles.list.length
      const { type } = extendOptions
      const options = {
        id,
        type,
        author: '',
        coverSrc: '',
        imgs: [],
        title: type === 'graphic' || type === 'selectGraphic' ? '标题' : '分享图片',
        content: '',
        digest: '',
        leaveWord: {
          checked: true,
          subCheckedItem: 1
        }
      }
      return Object.assign(options, extendOptions)
    },
    addArticle(extendOptions) {
      const newArticle = this.generateArticleData(extendOptions)
      if (extendOptions.isForFist) {
        this.$set(this.articles.list, 0, newArticle)
      } else {
        this.articles.list.push(newArticle)
      }
      this.changeActiveArticle(newArticle)
    },
    changeActiveArticle(item) {
      this.articles.activeItem = item
      if (item.type === 'graphic' || item.type === 'selectGraphic') {
        const editorIns = this.editor.ins
        editorIns.txt.html(this.processEmojiForDisplay(this.articles.activeItem.content))
        if (!this.articles.activeItem.digest) {
          this.articles.activeItem.digest = editorIns.txt.text().replace(/\\&nbsp;/g, '').slice(0, 55)
        }
      }
    },
    handleAddArticle(type, isForFist = false) {
      const fun = () => {
        switch (type) {
          case 'graphic':
            this.addArticle({
              type,
              isForFist
            })
            break
          case 'selectGraphic':
            this.chooseMsgDialog.show = true
            this.chooseMsgDialog.isForFist = true
            break
          case 'selectPicture':
            break
        }
      }
      if (isForFist) {
        const tip = this.articles.types[type].switchTip
        this.$confirm(tip, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$nextTick(() => {
            fun()
          })
        })
      } else {
        fun()
      }
    },
    initEditor() {
      const editor = new E(this.$refs.editorToolbar, this.$refs.editor)
      const generateEmojiData = () => categoryOrder.map(orderId => ({
        title: categoryShortNameMap[orderId],
        type: 'image',
        content: sortedEmojiData[orderId].map(emoji => ({
          alt: `${emoji.short_name}`,
          src: `/64/${emoji.image}`
        }))
      }))
      editor.customConfig.showLinkImg = false
      // 素材库添加图片
      editor.customConfig.onAddMaterialClick = () => {
        this.chooseImgDialog.show = true
      }
      // 自定义编辑器上传
      editor.customConfig.customUploadImg = (files) => {
        this.editor.uploadFiles = []
        files.forEach(file => {
          this.upload(file)
        })
      }
      editor.customConfig.onchange = (html) => {
        this.editor.wordNum = editor.txt.text().replace(/\\&nbsp;/g, '').length
        this.articles.activeItem.content = html
      }
      editor.customConfig.onchangeTimeout = 500
      editor.customConfig.zIndex = 0 // adjust with menu
      editor.customConfig.emotions = generateEmojiData()
      editor.create()
      editor.txt.html(this.processEmojiForDisplay(this.articles.activeItem.content))

      this.editor.ins = editor
    },
    insertEditorImg(imgSrc) {
      this.editor.ins.cmd.do('insertHTML', `<img src="${imgSrc}" style="display: block;max-width:100%;margin: 0 auto 5px;"/>`)
    },
    processEmojiForDisplay(content) {
      return emoji.replace_colons(content)
    },
    upload(rawFile) {
      const uid = Date.now() + this.editor.fileIndex++
      const formData = new FormData()
      formData.append('file', rawFile)
      formData.append('mediaType', 1)

      this.editor.uploadFiles.push({
        uid,
        status: 'uploading',
        src: ''
      })
      uploadContentPicture(formData).then(res => {
        const sucIdx = this.editor.uploadFiles.findIndex(item => item.uid === uid)
        if (sucIdx !== -1) {
          this.editor.uploadFiles[sucIdx].status = 'success'
          this.editor.uploadFiles[sucIdx].src = res.imageUrl
        }
        const isAllSuc = this.editor.uploadFiles.every(item => item.status === 'success')
        if (isAllSuc) {
          this.editor.uploadFiles.forEach(img => {
            this.insertEditorImg(img.src)
          })
        }
      })
    },
    moveUpArticle(index) {
      this.articles.list = moveArrayItem(this.articles.list, index, 1, -1)
    },
    moveDownArticle(index) {
      this.articles.list = moveArrayItem(this.articles.list, index, 1, 1)
    },
    delArticle(index) {
      this.changeActiveArticle(this.articles.list[index - 1])
      this.articles.list.splice(index, 1)
    },
    onLeaveWordCheckboxChange(val) {
      // 取消勾选留言对象
      if (!val) {
        this.articles.activeItem.leaveWord.subCheckedItem = 0
      } else {
        this.articles.activeItem.leaveWord.subCheckedItem = 1
      }
    },
    onSelectPictureFromMaterialConfirm(checkedImgs) {
      if (checkedImgs.length > 0) {
        checkedImgs.forEach(item => {
          this.insertEditorImg(item.imgSrc)
        })
      }
      this.chooseImgDialog.show = false
    },
    onSelectCoverFromMaterialConfirm(checkedImgs) {
      if (checkedImgs.length > 0) {
        this.articles.activeItem.coverSrc = checkedImgs[0].imgSrc
      }
      this.cover.chooseFromMaterialDialogShow = false
    },
    onSelectCoverFromContent() {
      const arr = deepFind(this.editor.ins.txt.getJSON(), item => item.tag === 'img', 'children')
      const imgSrcArr = []
      if (arr.length === 0) {
        this.$message.warning('正文中无可用做封面的图片')
        return false
      }
      arr.map(item => {
        item.attrs.forEach(nodeObj => nodeObj.name === 'src' && nodeObj.value && imgSrcArr.push(nodeObj.value))
      })
      this.cover.imgList = imgSrcArr
      this.cover.chooseFromContentDialogShow = true
    },
    onSelectCoverFromContentConfirm() {
      this.articles.activeItem.coverSrc = this.cover.checkedImg
      this.cover.chooseFromContentDialogShow = false
    },
    onSelectGraphicConfirm(checkedArticleItem) {
      console.log('checkedArticleItem', checkedArticleItem)
      if (!checkedArticleItem || checkedArticleItem.id === '') {
        this.$message({
          type: 'error',
          message: '请先选择图文消息'
        })
        return false
      }
      this.addArticle({
        id: Date.now() + this.articles.list.length,
        type: 'selectGraphic',
        title: checkedArticleItem.title,
        head: checkedArticleItem.head,
        content: checkedArticleItem.content,
        author: checkedArticleItem.author,
        digest: checkedArticleItem.desc,
        coverSrc: checkedArticleItem.skipUrl,
        leaveWord: {
          checked: checkedArticleItem.leaveMessageStatus !== 0,
          subCheckedItem: checkedArticleItem.leaveMessageStatus
        },
        isForFist: this.chooseMsgDialog.isForFist
      })
      this.chooseMsgDialog.isForFist = false
      this.chooseMsgDialog.show = false
    },
    selectPictureFromMaterial(src) {
      this.cover.checkedImg = src
    },
    clickLeaveWord() {
      if (this.articles.activeItem.leaveWord.checked) {
        return false
      }
      this.articles.activeItem.leaveWord.checked = true
      this.articles.activeItem.leaveWord.subCheckedItem = 1
    },
    save() {
      return new Promise(resolve => {
        let articles = []
        const validate = this.articles.list.every(item => item.title && item.content && item.coverSrc)
        if (!validate) {
          this.$message('每篇文章都必须填写：标题、内容和封面！')
          return false
        }
        articles = this.articles.list.map(item => {
          return {
            author: item.author,
            content: item.content,
            description: item.digest,
            leaveMessageStatus: item.leaveWord.subCheckedItem,
            title: item.title,
            head: item.coverSrc
          }
        })
        saveArticleDraft(articles).then(() => {
          this.$message.success('保存成功')
          resolve()
        })
      })
    },
    preview() {
      this.save().then(() => {
        this.previewDialogVisible = true
      })
    },
    saveTranspond() {
      this.save().then(() => {
        this.$router.push('/create-group-message')
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.create-group-message-edit {
  position: relative;
  height: calc(100vh - 50px);
  width: 100%;
  overflow: hidden;

  /deep/ .w-e-text-container {
    img[src^='/64/'] {
      width: 24px;
    }
  }

  /deep/ .w-e-panel-container {
    width: 340px !important;
  }

  /deep/ .w-e-emoticon-container {
    img {
      width: 24px;
    }
  }
}

.editor-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 10px 0 10px 80px;
  background-color: #f1f1f1;
  z-index: 2;
  @media (max-width: 1600px) {
    padding-left: 340px;
  }
}

.editor-menu-wrap {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  padding: 80px 60px 30px 30px;
  overflow-x: hidden;
  overflow-y: auto;
  z-index: 1; // adjust with editor-panel
}

.editor-menu {
  width: 310px;
  background-color: #fff;
  border-radius: 2px;

  .avatar {
    display: flex;
    align-items: center;
    padding: 10px;
    font-size: 14px;

    .name {
      margin-left: 10px;
    }
  }

  .article-item {
    position: relative;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    color: #777;
    cursor: pointer;
    border-bottom: 1px solid #f1f1f1;

    .article-item-title {
      padding-right: 10px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .article-item-img {
      flex: none;
      width: 50px;
      height: 50px;
    }

    &.desktop {
      padding: 0;
      border-bottom: none;
      background-color: #F5F7FA;

      .article-item-img {
        width: 100%;
        height: 144px;
      }

      .article-item-title {
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        padding: 10px;
        z-index: 1;
      }
    }

    &.active {
      border: 2px solid #07c160;

      .article-item-operation {
        display: flex;
      }
    }

    .article-item-operation {
      display: none;
      flex-direction: column;
      align-items: center;
      position: absolute;
      right: -55px;
      padding: 5px;
      border-radius: 50px;
      background-color: #fff;
    }

    .operation-item {
      padding: 10px;
      border-radius: 50px;

      &.el-icon-sort {
        transform: rotate(90deg);
      }

      &:hover {
        background-color: #ccc;
      }
    }
  }

  .create-article {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px 0;
    color: #999;
    cursor: pointer;

    .el-dropdown-link {
      padding: 10px;
    }
  }
}

.editor-wrap {
  position: relative;
  height: 100%;
  padding-top: 50px;
  margin-left: 80px;
  overflow-x: hidden;
  overflow-y: auto;
  @media (max-width: 1600px) {
    margin-left: 340px;
  }

  .draft-hint-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 768px;
    text-align: center;
    font-size: 14px;

    .draft-hint {
      padding: 8px;
      width: 300px;
      background-color: #ccc;
    }

    .el-icon-warning {
      color: red;
      font-size: 16px;
    }
  }

  .editor-panel,
  .picture-panel {
    position: relative;
    width: 768px;
    background-color: #fff;
    padding: 30px 95px 95px;
    margin: 30px auto 0;
    box-sizing: border-box;
    box-shadow: 0 1px 5px 0 rgba(0, 0, 0, 0.05);
  }

  .editor-panel {
    .title {
      font-size: 18px;
    }

    .author {
      font-size: 14px;
    }

    .title,
    .author {
      /deep/ .el-input__inner {
        border-top: none;
        border-left: none;
        border-right: none;
        border-radius: 0;
      }
    }
  }

  .picture-drag {
    margin: 20px -10px -10px 0;
    font-size: 0;
  }

  .picture-drag-item,
  .picture-drag-add {
    display: inline-block;
    width: 186px;
    height: 186px;
    margin-right: 10px;
    margin-bottom: 10px;
    vertical-align: middle;
  }

  .picture-drag-item {
    cursor: grab;
  }

  .picture-drag-add {
    cursor: pointer;

    .el-icon-plus {
      width: 100%;
      height: 186px;
      line-height: 186px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      text-align: center;
      font-size: 30px;
      color: #8c939d;
    }
  }

  .editor {
    min-height: 500px;
    margin-top: 10px;
    border-radius: 4px;
    border: 1px solid #DCDFE6;

    /deep/ .w-e-text {
      min-height: 500px;
      overflow-y: auto;
    }
  }

  .content {
    display: flex;
  }

  .cover-digest {
    .title {
      margin: 15px 0;
      font-size: 16px;
    }

    .cover {
      flex-shrink: 0;
      display: inline-block;
      cursor: pointer;
      position: relative;
      overflow: hidden;

      &:hover {
        border-color: #409eff;
      }

      .el-icon-plus {
        border: 1px dashed #d9d9d9;
        width: 211.5px;
        height: 96px;
        line-height: 96px;
        border-radius: 6px;
        text-align: center;
        font-size: 30px;
        color: #8c939d;
      }

      .el-icon-img {
        display: block;
        width: 211.5px;
        height: 96px;
        line-height: 96px;
        border-radius: 6px;
      }
    }

    .digest {
      margin-left: 10px;
      flex-shrink: 1;
      flex-basis: 100%;
    }
  }

  .leave-word {
    display: flex;
    align-items: center;
    margin-top: 20px;
    cursor: pointer;
    user-select: none;

    .leave-word-selected-sub-item {
      font-size: 14px;
      color: #888;
    }
  }

  .popover {
    margin-left: 10px;
  }

  .tool-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    width: 768px;
    margin-left: -95px;
    padding: 20px 60px 15px 30px;
    background-color: #fff;
    box-shadow: 0 -1px 4px 0 rgba(0, 0, 0, 0.05);
    z-index: 1;

    .left {
      color: #999;
      font-size: 14px;
    }
  }
}

.leave-word-radio { // popover dialog will be place in the body element
  margin-left: 20px;
  margin-top: 10px;
}

.dialog {
  .img-wrap {
    position: relative;
    margin-left: 10px;
    width: 115px;
    height: 115px;
    color: #fff;
    font-size: 40px;
    text-align: center;
    cursor: pointer;

    &:before {
      opacity: 0;
      position: absolute;
      z-index: 1;
      width: 115px;
      height: 115px;
      line-height: 115px;
      background-color: rgba(0, 0, 0, 0.7);
      transition: opacity 200ms;
    }

    &:hover, &.checked {
      &:before {
        opacity: 1;
      }
    }
  }
}

.select-picture {
  height: 400px;

  .select-picture-group {
    height: 100%;
    width: 190px;
    overflow-y: auto;
  }
}
</style>
