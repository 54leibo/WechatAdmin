<template>
  <div class="home">
    <img alt="Vue logo" src="../../assets/logo.png">
    <br/>
    <router-link to="/customs-menus" tag="h3">自定义菜单</router-link>
    <router-link to="/article-edit" tag="h3">文章编辑</router-link>
    <router-link to="/customs-menus" tag="h3">用户管理</router-link>
  </div>
</template>

<script>
export default {
  name: 'Home'
}
</script>

<style lang='scss' scoped>
.home {
  text-align: center;
}
h3 {
  cursor: pointer;
}
</style>
