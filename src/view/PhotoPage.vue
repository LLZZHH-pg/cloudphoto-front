<script setup>
import { useHeaderBase } from '../composables/useHeaderBase'

const { show } = useHeaderBase()
</script>

<template>
  <div>
    <p>Photo Page</p>

    <!-- 测试用按钮 -->
    <el-button type="primary" @click="show">
      打开控件栏
    </el-button>
  </div>
</template>