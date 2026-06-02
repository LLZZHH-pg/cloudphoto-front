<script setup>
import { computed, ref ,inject} from 'vue'
import { PriceTag } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { usePhotoSelection } from '../composables/usePhotoSelection'
import { useAlbumSelection } from '../composables/useAlbumSelection'
import { getCategories, updateCategory } from '../api/photo'

// ===== Props =====
const props = defineProps({
  /**
   * 源影集 ID
   * - 照片页使用时传 -1（或不传，默认值）
   * - 影集页使用时传当前打开的影集 ID
   */
  sourceAlbumId: {
    type: Number,
    default: -1
  }
})

const refreshKey = inject('refreshKey')

const dropdownRef = ref(null)

// ===== 根据上下文选用正确的 composable =====
const photoSelection = usePhotoSelection()
const albumSelection = useAlbumSelection()

const isPhotoPage = computed(() => props.sourceAlbumId === -1)

const selectedCount = computed(() =>
  isPhotoPage.value
    ? photoSelection.selectedCount.value
    : albumSelection.selectedCount.value
)

function getSelectedIds() {
  return isPhotoPage.value
    ? photoSelection.getSelectedIds()
    : albumSelection.getSelectedIds()
}

// ===== 分类列表 =====
const categories = ref([])
const loadingCategories = ref(false)
const customCategory = ref('')

// ===== 获取分类 =====
async function fetchCategories() {
  loadingCategories.value = true
  try {
    const data = await getCategories()
    categories.value = data || []
  } catch {
    ElMessage.error('获取分类列表失败')
  } finally {
    loadingCategories.value = false
  }
}

// ===== 下拉显隐 =====
function handleDropdownVisibleChange(visible) {
  if (visible) {
    fetchCategories()
  } else {
    customCategory.value = ''
  }
}

// ===== 点击某个分类 → 更新 =====
async function doUpdateCategory(category) {
  if (selectedCount.value === 0) {
    ElMessage.warning('请先选择照片')
    return
  }

  const ids = getSelectedIds()
  try {
    await updateCategory(ids, category)
    ElMessage.success(`已将 ${ids.length} 张照片的分类更新为「${category}」`)
    dropdownRef.value?.handleClose()
    refreshKey.value++
  } catch {
    ElMessage.error('更新分类失败，请重试')
  }
}

// ===== 点击预设分类 =====
function handleCategoryClick(category) {
  doUpdateCategory(category)
}

// ===== 点击"自定义"按钮 =====
function handleCustomCategory() {
  const cat = customCategory.value.trim()
  if (!cat) {
    ElMessage.warning('请输入自定义分类名称')
    return
  }
  doUpdateCategory(cat)
}
</script>

<template>
  <el-dropdown
    ref="dropdownRef"
    trigger="click"
    :hide-on-click="false"
    @visible-change="handleDropdownVisibleChange"
  >
    <!-- 触发按钮 -->
    <div class="update-category-btn">
      <el-icon :size="20">
        <PriceTag />
      </el-icon>
    </div>

    <template #dropdown>
      <el-dropdown-menu class="category-dropdown">
        <!-- 加载中 -->
        <div v-if="loadingCategories" class="dropdown-loading">
          <el-icon class="is-loading" :size="16"><Loading /></el-icon>
          <span>加载中...</span>
        </div>

        <!-- 空列表 -->
        <div v-else-if="categories.length === 0" class="dropdown-empty">
          暂无分类
        </div>

        <!-- 分类列表（每行是一个按钮） -->
        <template v-else>
          <el-dropdown-item
            v-for="cat in categories"
            :key="cat"
            @click="handleCategoryClick(cat)"
          >
            {{ cat }}
          </el-dropdown-item>

          <!-- 分割线 -->
          <div class="dropdown-divider" />

          <!-- 自定义输入行 -->
          <div class="custom-category-row" @click.stop>
            <el-button size="small" type="primary" plain @click="handleCustomCategory">
              提交
            </el-button>
            <el-input
              v-model="customCategory"
              size="small"
              placeholder="输入新分类"
              @keyup.enter="handleCustomCategory"
            />
          </div>
        </template>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped>
/* ── 按钮样式，与其他工具栏按钮一致 ── */
.update-category-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
  color: #fff;
}

.update-category-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* ── 下拉内容样式 ── */
.dropdown-loading,
.dropdown-empty {
  padding: 12px 16px;
  font-size: 13px;
  color: #909399;
  display: flex;
  align-items: center;
  gap: 6px;
}

.dropdown-divider {
  height: 1px;
  background-color: var(--el-border-color-lighter, #ebeef5);
  margin: 4px 0;
}

.custom-category-row {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 8px 12px;
  min-width: 180px;
}

.custom-category-row .el-button {
  flex-shrink: 0;
}

.custom-category-row .el-input {
  flex: 1;
}
</style>