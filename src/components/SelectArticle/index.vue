<template>
  <div class="select-article">
    <el-dialog
      class="dialog"
      title="从素材库选择图文"
      :visible.sync="visible"
      width="60%"
      @close="onClose"
    >
      <el-input v-model="searchVal" class="search-input" type="text" placeholder="搜索图文消息" size="small">
        <i slot="append" content="search-button" class="el-icon-search" @click="onSearch"></i>
      </el-input>
      <el-table
        :data="articles"
        style="width: 100%"
        v-loading="loading"
        @current-change="onSelectGraphicChange">
        <el-table-column label="选择" width="55">
          <template slot-scope="scope">
            <el-radio v-model="checkedItem.id" :label="scope.row.id">
              <i></i>
            </el-radio>
          </template>
        </el-table-column>
        <el-table-column
          prop="title"
          label="文章标题"
        >
        </el-table-column>
        <el-table-column
          prop="date"
          width="180"
          label="最近修改时间"
        >
        </el-table-column>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          class="pagination"
          :current-page.sync="pagination.current"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          layout="total, prev, pager, next, jumper"
          hide-on-single-page
          @current-change="handleCurrentChange"
        />
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="closeSelectGraphicDialog">确定</el-button>
        <el-button @click="visible = false">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
const articleListItem = require('../../mock/article/articleListItem')
const getArticleListSimple = async () => {
  const list = []
  for (let i = 0; i < 10; i++) {
    list.push({
      ...articleListItem,
      id: `id_${i}`,
      head: require('../../assets/logo.png')
    })
  }

  return {
    total: 100,
    list
  }
}

export default {
  name: 'SelectArticle',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: this.value,
      searchVal: '',
      articles: [],
      checkedItem: {},
      pagination: {
        current: 1,
        pageSize: 10,
        total: 100
      },
      loading: false
    }
  },
  watch: {
    value() {
      this.visible = this.value
      if (this.visible) {
        this.getArticleListSimple()
      }
    }
  },
  // created() {
  //   this.getArticleListSimple()
  // },
  methods: {
    init() {
      this.searchVal = ''
      this.articles = []
      this.checkedItem = {
        id: ''
      }
      this.pagination = {
        current: 1,
        pageSize: 10,
        total: 100
      }
    },
    getArticleListSimple() {
      this.loading = true
      getArticleListSimple({
        keyword: this.searchVal,
        pageNum: this.pagination.current,
        pageSize: this.pagination.pageSize
      })
        .then(res => {
          this.loading = false
          if (!(res instanceof Object)) {
            return
          }
          this.pagination.total = res.total
          this.articles = res.list.map(item => ({
            id: item.id,
            date: item.createTime,
            title: item.title,
            skipUrl: item.url,
            head: item.head,
            desc: item.description,
            content: item.content,
            author: item.author,
            leaveMessageStatus: item.leaveMessageStatus
          }))
        })
    },
    onClose() {
      this.$emit('input', false)
      this.$nextTick(() => {
        this.init()
      })
    },
    onSelectGraphicChange(item) {
      if (item) {
        this.checkedItem = item
      }
    },
    closeSelectGraphicDialog() {
      this.$emit('select', this.checkedItem)
      this.visible = false
      this.$emit('input', false)
    },
    onSearch() {
      this.getArticleListSimple()
    },
    handleCurrentChange(page) {
      this.pagination.current = page
      this.getArticleListSimple()
    }
  }
}
</script>

<style lang='scss' scoped>
.search-input {
  margin-bottom: 10px;
  width: 200px;
}

.pagination-wrap {
  margin-top: 50px;
  display: flex;
  justify-content: flex-end;
}
</style>

