<script setup>
    // import UserInfo from './components/UserInfo.vue';
    // import PhotoPage from './view/PhotoPage.vue';
    // import AlbumPage from './view/AlbumPage.vue';
    // import RecyclePage from './view/RecyclePage.vue';

    import { ref } from 'vue'
    const tabPosition = ref('left')
</script>

<template>
  <div class="common-layout">
    <el-container>
        <el-header height="5vh" >Header</el-header>

        <el-tabs :tab-position="tabPosition" style="height: 95vh" class="main-tabs">
            <el-tab-pane label="User">User</el-tab-pane>
            <el-tab-pane label="Config">Config</el-tab-pane>
            <el-tab-pane label="Role">Role</el-tab-pane>
        </el-tabs>

    </el-container>
  </div>
</template>

<style>
    .main-tabs > .el-tabs__content {
        padding: 32px;
        color: #6b778c;
        font-size: 32px;
        font-weight: 600;
    }

    .el-tabs--right .el-tabs__content,
    .el-tabs--left .el-tabs__content {
        height: 100%;
    }
</style>
