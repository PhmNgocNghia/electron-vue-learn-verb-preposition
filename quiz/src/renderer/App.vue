<template>
  <div id="app">
    <v-app>
      <v-navigation-drawer
        fixed
        v-model="drawer"
        app
      >
        <v-list>
          <v-list-tile
            router
            :to="item.to"
            :key="item.title"
            v-for="item in items"
            exact
          >
            <v-list-tile-action>
              <v-icon v-html="item.icon"></v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title v-text="item.title"></v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-group
            :key = "item.title"
            v-for = "item in nestedItems"
            :prepend-icon="item.icon"
            value="true"
            >
              <v-list-tile slot="activator">
                <v-list-tile-title>{{item.title}}</v-list-tile-title>
              </v-list-tile>
              <v-list-tile
                router
                :to="childItem.to"
                :key="childItem.title"
                v-for="childItem in item.childItems"
                exact
              >
                <v-list-tile-action>
                  <v-icon v-html="childItem.icon"></v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                  <v-list-tile-title v-text="childItem.title"></v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
        </v-list-group>
        </v-list>
      </v-navigation-drawer>
      <v-toolbar fixed app dark color="blue">
        <v-toolbar-side-icon @click.native.stop="drawer = !drawer"></v-toolbar-side-icon>
        <v-toolbar-title v-text="title"></v-toolbar-title>
      </v-toolbar>
      <v-content>
        <v-container fluid>
          <v-slide-y-transition mode="out-in">
            <router-view :key="$route.params.quizType"></router-view>
          </v-slide-y-transition>
        </v-container>
      </v-content>
    </v-app>
  </div>
</template>

<script>
  import {
    quizType
  } from './constant.js'
  import helper from './helper.js'
  export default {
    created () {
      // Đọc settings
      const settings = helper.readSettings()
      this.$store.dispatch('setSettings', settings)
    },

    data: () => ({
      drawer: true,
      fixed: false,
      items: [
        { icon: 'library_add', title: 'Học từ mới', to: '/quiz/' + quizType.learnNew },
        { icon: 'dashboard', title: 'Thống kê', to: '/' },
        { icon: 'settings', title: 'Cài đặt', to: '/settings' },
        { icon: 'info', title: 'Thông tin phần mềm', to: '/about' }
      ],
      nestedItems: [
        {
          icon: 'edit',
          title: 'Ôn lại từ',
          childItems: [
            /**
             * Review word
             * Type :
             * learned
             * wrong
             * bookmark
             */

            /**
             * Review
             * sort theo ngày học tăng dần
             * chọn n từ đầu tiên
             */
            {icon: 'assignment_turned_in', title: 'Đã học', to: '/quiz/' + quizType.reviewLearned},
            {icon: 'assignment_returned', title: 'Đã lưu', to: '/quiz/' + quizType.reviewBookmarked}
          ]
        }
      ],
      title: 'Động từ kèm giới từ'
    })
  }
</script>

<style>
  @import url('./assets/css/MaterialIcon.css');
  /* Global CSS */
  :not(input):not(textarea),
  :not(input):not(textarea)::after,
  :not(input):not(textarea)::before {
      -webkit-user-select: none;
      user-select: none;
      cursor: default;
  }

  .w-100 {
    width: 100%
  }
</style>
