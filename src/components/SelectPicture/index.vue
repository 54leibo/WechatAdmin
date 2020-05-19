<template>
  <div class="select-picture">
    <el-dialog
      class="dialog"
      title="选择图片"
      :visible.sync="visible"
      width="980px"
      @close="close"
    >
      <div class="group">
        <el-menu
          :default-active="groups.active">
          <el-menu-item @click.native="handleGroupItemClick('')" index="">
            <template slot="title">
              <span>全部图片</span>
              <span class="group-count">({{ groups.total }})</span>
            </template>
          </el-menu-item>
          <el-menu-item v-for="groupItem in groups.list"
                        @click.native="handleGroupItemClick(groupItem.tagName)"
                        :key="groupItem.tagName"
                        :index="groupItem.tagName">
            <template slot="title">
              <span>{{ groupItem.tagName }}</span>
              <span class="group-count">({{ groupItem.count }})</span>
            </template>
          </el-menu-item>
        </el-menu>
        <el-popover
          v-model="groups.create.popVisible"
          placement="bottom"
          width="262"
          trigger="click">
          <el-form :model="groups.create.ruleForm" :rules="groups.create.rules" ref="createForm" label-width="80px">
            <el-form-item class="create-form-item" label="活动名称" prop="tagName">
              <el-input v-model="groups.create.ruleForm.tagName"></el-input>
            </el-form-item>
            <div class="create-pop-footer">
              <el-button type="primary" @click="createGroup">新建</el-button>
              <el-button @click="groups.create.popVisible = false">取消</el-button>
            </div>
          </el-form>
          <div slot="reference" class="group-create">新建分组</div>
        </el-popover>
      </div>
      <div v-loading="loading" class="group-content">
        <ul v-show="!noData" class="img-list">
          <li v-for="item in imgList" :key="item.id" class="img-item">
            <div class="img-wrap"
                 @click="checkedImgChange(item)"
                 :class="[checkedImgIdList.includes(item.id) ? 'checked' : '', isSingle ? 'img-wrap__single' : 'img-wrap__multiple']">
              <el-image class="img" :src="item.imgSrc" fit="contain"></el-image>
              <el-checkbox v-if="!isSingle" class="checkbox" :value="checkedImgIdList.includes(item.id)"
                           @change="checkedImgChange(item)"></el-checkbox>
              <p class="img-name">{{ item.name }}</p>
            </div>
          </li>
        </ul>
        <p v-show="noData" class="no-data">暂无数据</p>
        <el-pagination
          :hide-on-single-page="!pagination.show"
          class="pagination"
          :page-size="pagination.pageSize"
          layout="total, prev, pager, next, jumper"
          @current-change="onPaginationChange"
          :total="pagination.total">
        </el-pagination>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="confirm">确定</el-button>
        <el-button @click="visible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import imgItem from '../../mock/material/imgItem'
import tagItem from '../../mock/material/tagItem'

const getImgList = async () => {
  const list = []
  for (let i = 0; i < 100; i++) {
    list.push({
      ...imgItem,
      id: `id_${i}`,
      url: require('../../assets/logo.png')
    })
  }
  return {
    list,
    total: 100
  }
}
const getMaterialGroupList = async () => {
  const list = []
  for (let i = 0; i < 10; i++) {
    if (i === 0) {
      list.push(tagItem)
    } else {
      list.push({
        ...tagItem,
        count: i,
        tagName: `标签_${i}`
      })
    }
  }
  return list
}
const addNewGroup = async () => ({})

export default {
  name: 'SelectPicture',
  props: {
    value: {
      type: Boolean,
      default: false
    },
    isSingle: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: this.value,
      groups: {
        list: [],
        active: '',
        total: 0,
        create: {
          popVisible: false,
          ruleForm: {
            tagName: ''
          },
          rules: {
            tagName: [
              { required: true, message: '请输入分组名', trigger: 'blur' },
              { min: 1, max: 5, message: '分组名为1至6个字符', trigger: 'blur' }
            ]
          }
        }
      },
      imgList: [],
      checkedImgIdList: [],
      checkedImgList: [],
      pagination: {
        show: false,
        current: 1,
        total: 0,
        pageSize: 18
      },
      noData: false,
      loading: false
    }
  },
  watch: {
    value() {
      this.visible = this.value
      if (this.visible) {
        this.getMaterialGroupList()
        this.getImgList()
      }
    },
    'groups.active'() {
      this.getImgList()
    }
  },
  // mounted() {
  //   this.getMaterialGroupList()
  //   this.getImgList()
  // },
  methods: {
    close() {
      this.$emit('input', false)
      this.$nextTick(() => {
        this.init()
      })
    },
    confirm() {
      this.$emit('confirm', this.checkedImgList)
    },
    init() {
      this.groups.create.ruleForm.tagName = ''
      this.groups.total = 0
      this.groups.active = ''
      this.groups.list = []
      this.imgList = []
      this.checkedImgIdList = []
      this.checkedImgList = []
    },
    handleGroupItemClick(tagName) {
      if (this.groups.active === tagName) {
        return false
      }
      this.groups.active = tagName
      this.getImgList()
    },
    onPaginationChange(currentPage) {
      this.pagination.current = currentPage
      this.getImgList()
    },
    getMaterialGroupList() {
      getMaterialGroupList(1).then(res => {
        if (!(res instanceof Object)) {
          return
        }
        this.groups.list = res
      })
    },
    getImgList() {
      this.loading = true
      getImgList({
        mediaType: 1,
        pageSize: this.pagination.pageSize,
        pageNum: this.pagination.current,
        tagName: this.groups.active
      }).then(res => {
        this.loading = false
        if (!(res instanceof Object)) {
          return
        }
        if (this.groups.active === '') {
          this.groups.total = res.total
        }
        this.pagination.show = res.total > this.pagination.pageSize
        this.pagination.total = res.total
        this.noData = res.total === 0
        this.imgList = res.list.map(img => ({
          id: img.id,
          imgSrc: img.url,
          name: img.filename
        }))
      })
    },
    createGroup() {
      this.$refs['createForm'].validate((valid) => {
        if (valid) {
          const tagName = this.groups.create.ruleForm.tagName
          addNewGroup({
            mediaType: 1,
            tagName
          }).then(() => {
            this.groups.create.ruleForm.tagName = ''
            this.groups.create.popVisible = false
            this.getMaterialGroupList()
            this.$message.success('添加成功！')
          })
        }
      })
    },
    checkedImgChange(img) {
      if (this.isSingle) {
        this.checkedImgIdList = [img.id]
        this.checkedImgList = [img]
      } else {
        const checkedImgIndex = this.checkedImgIdList.indexOf(img.id)
        if (checkedImgIndex !== -1) {
          this.checkedImgIdList.splice(checkedImgIndex, 1)
          this.checkedImgList.splice(checkedImgIndex, 1)
        } else {
          this.checkedImgIdList.push(img.id)
          this.checkedImgList.push(img)
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.dialog {
 /deep/ .el-dialog__body {
    display: flex;
    padding-left: 20px;
    padding-right: 0;
  }
}

.group {
  height: 475px;
}

.group {
  position: relative;
  flex: none;
  width: 169px;
  padding-bottom: 42px;
  border-right: solid 1px #e6e6e6;

 /deep/ .el-menu {
    height: 100%;
    overflow-y: auto;
    border-right: none;
  }

 /deep/ .el-menu-item {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.group-create {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  font-size: 14px;
  line-height: 42px;
  color: #409EFF;
  cursor: pointer;
}

.group-count {
  color: #9A9A9A;
}

.group-content {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.img-list {
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  width: 725px;
  height: 475px;
  margin: 0 auto;
  overflow-y: scroll;
}

.img-item {
  margin: 0 13px 20px 0;

  &:nth-child(6n) {
    margin-right: 0;
  }
}

.img-wrap {
  position: relative;
  width: 110px;
  color: #fff;
  /*font-size: 40px;*/
  font-size: 0;
  text-align: center;
  cursor: pointer;

  &:hover, &.checked {
    &:before {
      display: block;
    }
  }

  &.checked {
    &:before {
      background-color: rgba(32, 160, 255, 0.2);
    }
  }

  &:before {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    width: 110px;
    height: 110px;
    z-index: 1;
    box-shadow: 0 0 0 2px #409EFF inset;
  }

  &__multiple {
    .checkbox {
      position: absolute;
      left: 5px;
      top: 5px;
      transform: translate(6px, 6px) scale(1.5);
      z-index: 2;
    }
  }

  .img {
    width: 110px;
    height: 110px;
  }

  .img-name {
    display: block;
    margin-top: 8px;
    margin-bottom: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    word-wrap: normal;
    text-align: center;
    font-size: 14px;
    line-height: 20px;
    color: #353535;
  }
}

.no-data {
  width: 100%;
  height: 475px;
  margin: 0;
  line-height: 475px;
  color: #353535;
  font-size: 14px;
  text-align: center;
}

.pagination {
  text-align: right;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  align-items: center;

 /deep/ .el-button {
    min-width: 100px;
  }
}

.create-pop {
  padding: 20px;
}

.create-form-item {
 /deep/ .el-form-item__label {
    text-align: left;
  }
}

.create-pop-footer {
  text-align: center;
}
</style>

