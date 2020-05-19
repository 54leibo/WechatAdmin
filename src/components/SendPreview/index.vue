<template>
  <el-dialog
    class="dialog"
    title="发送预览"
    :visible.sync="visible"
    width="60%"
    @close="close"
  >
    <div class="preview">
      <p class="preview-tip">关注公众号后并添加PlanetID才能接受图文消息预览，最多只能添加10个ID号</p>
      <div class="preview-ids">
        <el-tag
          v-for="(id, idIdx) in planetIds"
          :key="id"
          closable
          :disable-transitions="false"
          @close="handleDelPlanetTag(idIdx)"
        >
          {{ id }}
        </el-tag>
        <el-input
          v-show="inputVisible && !isGreateThenMax"
          ref="planetIdInput"
          v-model.trim="planetId"
          size="small"
          class="preview-ids-input"
          placeholder="可输入多个Planet ID，按回车分隔"
          @keyup.enter.native="handlePlanetIdConfirm"
          @blur="handlePlanetIdConfirm"
        />
        <el-button v-show="!inputVisible && !isGreateThenMax" class="preview-ids-add" size="small" @click="showPlanetIdInput">添加PlanetId</el-button>
      </div>
      <p class="preview-prompt">预览功能仅用于公众号查看文章效果，不适用于公众传播，预览链接会在短期内失效</p>
    </div>
    <div slot="footer" class="dialog-footer">
      <el-button type="default" @click="close">取消</el-button>
      <el-button type="primary" @click="confirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
const preview = async () => {}

export default {
  name: 'SendPreview',
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      visible: this.value,
      inputVisible: false,
      isGreateThenMax: false,
      planetId: '',
      planetIds: []
    }
  },
  watch: {
    value() {
      this.visible = this.value
    },
    'planetIds.length'(len) {
      this.isGreateThenMax = len > 10
    }
  },
  methods: {
    handleDelPlanetTag(idIdx) {
      this.planetIds.splice(idIdx, 1)
    },
    showPlanetIdInput() {
      this.inputVisible = true
      this.$nextTick(() => {
        this.$refs.planetIdInput.focus()
      })
    },
    handlePlanetIdConfirm() {
      const planetId = this.planetId
      if (planetId && !this.planetIds.includes(planetId)) {
        this.planetIds.push(planetId)
      }
      this.inputVisible = false
      this.planetId = ''
    },
    close() {
      this.visible = false
      this.$emit('input', false)
    },
    confirm() {
      const planetIds = this.planetIds
      if (planetIds.length === 0) {
        this.$message.warning('请输入预览的PlanetId')
        return false
      }
      preview(planetIds).then(() => {
        this.$message.success('发送预览成功，请留意您的信息')
        this.visible = false
      })
    }
  }
}
</script>

<style lang='scss' scoped>
.preview {
  padding: 30px 60px;

  .preview-tip {
    font-size: 14px;
  }

  .preview-ids {
    display: flex;
    align-items: center;

   /deep/ .el-tag + .el-tag {
      margin-left: 10px;
    }

    .preview-ids-input {
      max-width: 300px;
      margin-left: 10px;
      height: 32px;
      line-height: 30px;
      padding-top: 0;
      padding-bottom: 0;
    }

    .preview-ids-add {
      margin-left: 10px;
      vertical-align: bottom;
    }
  }

  .preview-prompt {
    font-size: 14px;
    color: #9A9A9A;
  }
}
</style>

