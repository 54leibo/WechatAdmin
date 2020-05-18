<template>
  <div class="customs-menus">
    <div class="page-inner-title">自定义菜单</div>
    <div class="page-inner-main">
      <div class="menu-preview">
        <div class="header">XXX官方公众号</div>
        <div class="footer">
          <c-draggable v-model="menus" tag="ul" class="container" draggable=".menu-item-draggable">
            <li v-for="item in menus" :key="item.id" class="menu-item menu-item-draggable"
                :class="{active: item.id === activeMenuId && activeSubMenuId === 0 }"
                @click="switchMixMenuItem('menu', item)"
            >
              <div v-show="item.id === activeMenuId" class="menu-sub" draggable=".menu-sub-item-draggable">
                <!-- not use ul and li, for refusing webStorm error -->
                <c-draggable tag="div" class="menu-sub-list">
                  <div v-for="subItem in item.subMenus" :key="subItem.id" class="menu-sub-item menu-sub-item-draggable"
                       :class="{active: subItem.id === activeSubMenuId}"
                       @click.stop="switchMixMenuItem('subMenu', subItem)">
                    <div class="menu-sub-item-inner">{{ subItem.name }}</div>
                  </div>
                  <div v-if="item.subMenus.length < 5" slot="footer" class="menu-sub-item"
                       @click.stop="addMixMenuItem('subMenu')">
                    <i class="el-icon-plus"></i>
                  </div>
                </c-draggable>
                <i class="menu-sub-item-arrow"></i>
              </div>
              {{ item.name }}
            </li>
            <li v-if="menus.length < 3" slot="footer" class="menu-item" :class="{active: menus.length === 0}"
                @click="addMixMenuItem('menu')"
            >
              <i class="el-icon-plus"></i>
              {{ menus.length === 0 ? '添加菜单' : '' }}
            </li>
          </c-draggable>
        </div>
      </div>
      <div class="menu-form">
        <div v-if="activeMixMenu">
          <div class="header">
            <span class="header-left">菜单名称</span>
            <el-button type="text" @click="delMixMenu">删除菜单</el-button>
          </div>
          <el-form ref="form" label-width="100px" class="form-content" label-position="left">
            <el-form-item label="菜单名称">
              <el-input v-model="activeMixMenu.name" placeholder="请输入菜单名称"></el-input>
              <div class="form-name-hint">仅支持中英文和数字，字数不超过8个汉字或16个字母</div>
            </el-form-item>
            <el-form-item v-if="!(hasSubMenus(activeMixMenu))" label="菜单内容">
              <el-radio v-model="activeMixMenu.contentType" label="1" disabled>发送消息</el-radio>
              <el-radio v-model="activeMixMenu.contentType" label="2">跳转网页</el-radio>
            </el-form-item>
            <el-form-item v-if="!(hasSubMenus(activeMixMenu))" label-width="0">
              <div class="content">
                <span class="content-des">订阅者点击该子菜单会跳到以下链接</span>
                <div class="content-input-wrap">
                  <span class="content-input-title">页面地址</span>
                  <el-input v-model="activeMixMenu.content" class="content-input" size="small"
                            placeholder="认证后才可手动输入地址"></el-input>
                  <div class="content-select">
                    <el-button type="text" @click="selectFromArticle">从公众号图文消息中选择</el-button>
                  </div>
                </div>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div v-else class="empty">点击左侧菜单进行编辑操作</div>
      </div>
    </div>
    <div class="save-publish-wrap">
      <el-button type="primary" class="save-publish" @click="savePublish">保存并发布</el-button>
    </div>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'CustomsMenus',
  components: { CDraggable: draggable },
  data() {
    return {
      menus: [],
      activeMenuId: 0,
      activeSubMenuId: 0 // default set 0
    }
  },
  computed: {
    activeMenuIndex() {
      return this.menus.findIndex(item => item.id === this.activeMenuId)
    },
    // menuItem or menuSubMenu
    activeMixMenu() {
      if (this.activeSubMenuId) {
        const activeSubMenuIndex = this.menus[this.activeMenuIndex].subMenus.findIndex(item => item.id === this.activeSubMenuId)
        return this.menus[this.activeMenuIndex].subMenus[activeSubMenuIndex]
      } else if (this.activeMenuId) {
        return this.menus[this.activeMenuIndex]
      }

      return null
    }
  },
  watch: {
    activeMenuId(val) { // if stay in menu, activeSubMenuId set to 0, but switch to the same activeMenuId should set manually
      if (val !== 0) {
        this.activeSubMenuId = 0
      }
    },
    // for validate: limit words number
    'activeMixMenu.name'(val) {
      if (!val) {
        return
      }
      val = val.toString().replace(/[^a-z0-9\u4e00-\u9fa5]/ig, '')
      const getLen = () => val.length + val.replace(/[^\u4e00-\u9fa5]/ig, '').length
      let mixLen = getLen()

      while (mixLen > 16) {
        val = val.slice(0, val.length - 1)
        mixLen = getLen()
      }

      this.activeMixMenu.name = val
    }
  },
  created() {
    setTimeout(res => {
      if (!(res instanceof Object)) {
        return
      }
      this.menus = res.map((item, index) => ({
        id: `id_${index}`,
        name: item.title,
        contentType: `${item.type}`,
        content: item.content,
        subMenus: (item.subMenus || []).map((subItem, subIndex) => ({
          id: `id_${subIndex}`,
          name: subItem.title,
          contentType: `${subItem.type}`,
          content: subItem.content
        }))
      }))
    }, 1000)
  },
  methods: {
    switchMixMenuItem(type, item) { // type: 'menu' | 'subMenu'
      // no activeMixMenu is the first switch in
      if (this.activeMixMenu) {
        if (!this.validateMenuItem(this.activeMixMenu)) {
          return
        }
      }
      if (type === 'menu') {
        this.activeMenuId = item.id
        this.activeSubMenuId = 0 // should set manually, if the activeMenuId didn't change
      } else if (type === 'subMenu') {
        this.activeSubMenuId = item.id
      }
    },
    addMixMenuItem(type) { // type: 'menu' | 'subMenu'
      // no activeMixMenu is the first switch in
      if (this.activeMixMenu) {
        if (!this.validateMenuItem(this.activeMixMenu)) {
          return
        }
      }
      const id = Date.now()
      if (type === 'menu') {
        this.menus.push({
          id,
          name: '菜单名称',
          contentType: '2',
          content: 'http://www.baidu.com',
          subMenus: []
        })
        this.activeMenuId = id
      } else if (type === 'subMenu') {
        const menuItem = this.menus[this.activeMenuIndex]
        const process = () => {
          // todo remove all 'http://www.baidu.com'
          menuItem.subMenus.push({
            id,
            name: '子菜单名称',
            contentType: '2',
            content: 'http://www.baidu.com'
          })
          menuItem.content = ''
          this.activeSubMenuId = id
        }
        if (menuItem && menuItem.content && (!menuItem.subMenus || menuItem.subMenus.length <= 0)) {
          this.$confirm('添加子菜单后，一级菜单的内容将被清除。确定添加子菜单？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            process()
          }).catch(() => {})
        } else {
          process()
        }
      }
    },
    delMixMenu() {
      if (!this.activeMenuId) {
        console.error('this.activeMenuId can\'t be 0')
        return
      }
      if (this.activeSubMenuId) {
        const activeSubMenuIndex = this.menus[this.activeMenuIndex].subMenus.findIndex(item => item.id === this.activeSubMenuId)
        this.menus[this.activeMenuIndex].subMenus.splice(activeSubMenuIndex, 1)
        return
      }

      this.menus.splice(this.activeMenuIndex, 1)

      this.activeMenuId = 0
      this.activeSubMenuId = 0
    },
    hasSubMenus(menuItem) {
      return menuItem.subMenus && menuItem.subMenus.length
    },
    validateMenuItem(mixMenuItem, silent) {
      // first active menuItem
      if (!mixMenuItem.name) {
        !silent && this.$message({
          type: 'error',
          message: '菜单名称不能为空'
        })
        return
      }
      if (!this.hasSubMenus(mixMenuItem) && !mixMenuItem.content) {
        !silent && this.$message({
          type: 'error',
          message: '页面地址不能为空'
        })
        return
      }
      return true
    },
    savePublish() {
      const validate = this.menus.every(item => this.validateMenuItem(item, true) && item.subMenus.every(subItem => this.validateMenuItem(subItem, true)))

      if (!validate) {
        this.$message({
          type: 'error',
          message: '所有菜单都必须包含名称，除包含子菜单的其它所有菜单也需要包含跳转链接'
        })
        return
      }

      setTimeout(() => {
        console.log('this.menus', this.menus)
        this.$message.success('更新成功')
      }, 1000)
    },
    selectFromArticle() {
      console.log('click selectFromArticle')
    }
  }
}
</script>

<style lang='scss' scoped>
.customs-menus {

}

.page-inner-main {
  display: flex;
  flex-wrap: wrap;
}

.menu-preview {
  position: relative;
  margin-right: 20px;
  flex: 0 0 294px;
  height: 582px;
  border: 1px solid #eee;
  background: url(../../icons/png/bg_mobile_head.png) no-repeat;
  background-size: 100%;

  .header {
    color: #fff;
    text-align: center;
    padding-top: 30px;
    font-size: 15px;
    width: auto;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
    margin: 0 30px;
  }

  .footer {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: url(../../icons/png/bg_mobile_foot.png) 0 0 no-repeat;
    user-select: none;
    cursor: pointer;

    .container {
      display: flex;
      justify-content: space-between;
      margin: 0;
      border-top: 1px solid #eee;
      padding-left: 43px;
      width: 100%;
      list-style: none;
    }

    .menu-item {
      position: relative;
      box-sizing: border-box;
      flex-grow: 1;
      flex-shrink: 0;
      flex-basis: 33.33%;
      border-right: 1px solid #eee;
      height: 50px;
      line-height: 50px;
      text-align: center;
      font-size: 14px;
      color: #666;

      &:last-of-type {
        border: none;
      }

      &.active {
        border: 1px solid #20a0ff;
        color: #20a0ff;
      }
    }

    .menu-sub {
      position: absolute;
      bottom: 60px;
      left: 0;
      width: 100%;
      border: 1px solid #eee;
      background-color: #fafafa;
    }

    .menu-sub-list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .menu-sub-item {
      color: #666;

      &:hover {
        background-color: #ccc;
      }

      &:last-of-type {
        .menu-sub-item-inner {
          border-bottom: none;
        }
      }

      &.active {
        border: 1px solid #20a0ff;
        color: #20a0ff;

        .menu-sub-item-inner {
          border-bottom: none;
        }
      }

      .menu-sub-item-inner {
        margin: 0 8px;
        border-bottom: 1px solid #eee;
        height: 50px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .menu-sub-item-arrow {
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-top-color: #eee;
      border-bottom-width: 0;

      &:before {
        content: ' ';
        position: absolute;
        left: -7px;
        top: -8px;
        width: 0;
        height: 0;
        border: 7px solid transparent;
        border-top-color: #fafafa;
        border-bottom-width: 0;
      }
    }
  }
}

.menu-form {
  flex: 1 1%;
  border: 1px solid #eee;
  background-color: #f1f1f1;
  padding: 10px 20px;
  font-size: 15px;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ccc;
  }

  .empty {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #888;
    font-size: 14px;
  }

  .form-name-hint {
    color: #888;
    margin-top: 5px;
    line-height: normal;
  }
}

.form-content {
  margin-top: 40px;

  .content {
    margin-top: -20px;
    padding: 0 15px;
    background-color: #fff;
  }

  .content-des {
    color: #888;
  }

  .content-input {
    display: inline-block;
    width: 250px;
    margin-left: 20px;
  }

  .content-select {
    margin-left: 80px;
    margin-top: -5px;
    padding-bottom: 20px;
  }
}

.save-publish-wrap {
  display: flex;
  justify-content: center;

  .save-publish {
    margin: 0 auto;
  }
}
</style>
