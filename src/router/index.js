import Router from 'vue-router'
import Home from '../views/home'
import CustomsMenus from '../views/customsMenus'
import ArticleEdit from '../views/articleEdit/edit'
import Vue from 'vue'

Vue.use(Router)

const routes = new Router({
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/customs-menus',
      name: 'customsMenus',
      component: CustomsMenus
    },
    {
      path: '/article-edit',
      name: 'articleEdit',
      component: ArticleEdit
    }
  ]
})

export default routes
