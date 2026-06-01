<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { MoreFilled, Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  album: {
    type: Object,
    required: true
    // { id, name, coverUrl, photoCount, description, isPublic }
  }
})

const emit = defineEmits(['edit', 'delete'])

const router = useRouter()
const hover = ref(false)

/** 封面图：有 coverUrl 就用，没有则返回空字符串（CSS 渐变背景兜底） */
const coverSrc = computed(() => props.album.coverUrl || '')

function goDetail() {
  router.push({ name: 'album-detail', params: { id: props.album.id } })
}

function onEdit() {
  emit('edit', props.album)
}

function onDelete() {
  emit('delete', props.album)
}
</script>

<template>
  <div
    class="album-card"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
    @click="goDetail"
  >
    <!-- 封面图 / 默认占位 -->
    <div class="album-cover-wrapper">
      <img
        v-if="coverSrc"
        :src="coverSrc"
        :alt="album.name"
        class="album-cover-img"
        loading="lazy"
      />
      <div v-else class="album-cover-placeholder">
        <el-icon :size="40"><Picture /></el-icon>
      </div>

      <!-- 底部渐变遮罩 + 名称 -->
      <div class="album-cover-gradient" />
      <span class="album-name">{{ album.name }}</span>
    </div>

    <!-- 照片数量角标 -->
    <span class="album-count-badge">{{ album.photoCount ?? 0 }}张</span>

    <!-- 更多操作按钮（hover 显示） -->
    <div v-show="hover" class="album-more-btn" @click.stop>
      <el-dropdown trigger="click" placement="bottom-end">
        <div class="more-btn-inner">
          <el-icon :size="16"><MoreFilled /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="onEdit">
              <el-icon :size="14"><Edit /></el-icon>
              <span>编辑</span>
            </el-dropdown-item>
            <el-dropdown-item @click="onDelete" divided>
              <el-icon :size="14"><Delete /></el-icon>
              <span>删除</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: #f5f5f5;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.album-card:hover {
  transform: scale(1.03);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* ===== 封面 ===== */
.album-cover-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.album-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.album-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 0.5);
}

/* ===== 底部渐变 + 名称 ===== */
.album-cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  pointer-events: none;
  border-radius: 0 0 10px 10px;
}

.album-name {
  position: absolute;
  bottom: 10px;
  left: 12px;
  right: 12px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

/* ===== 数量角标 ===== */
.album-count-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  pointer-events: none;
  z-index: 2;
}

/* ===== 更多按钮 ===== */
.album-more-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  z-index: 3;
}

.more-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  transition: background 0.15s;
}

.more-btn-inner:hover {
  background: rgba(0, 0, 0, 0.7);
}
</style>
