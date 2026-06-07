<script setup>
import { ref, watch } from 'vue'
import { createAlbum, updateAlbum } from '../api/album'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  /** 编辑时传入已有影集数据，创建时为 null */
  album: {
    type: Object,
    default: null
    // { id, name, description, coverUrl }
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const isEdit = ref(false)

// ===== 表单数据 =====
const form = ref({
  name: '',
  description: '',
  coverUrl: ''
})

const submitting = ref(false)

// ===== 表单校验规则 =====
const rules = {
  name: [
    { required: true, message: '请输入影集名称', trigger: 'blur' },
    { max: 50, message: '名称不能超过 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '描述不能超过 200 个字符', trigger: 'blur' }
  ]
}

const formRef = ref(null)

// ===== 打开弹窗时回填数据 =====
watch(() => props.modelValue, (val) => {
  if (val) {
    if (props.album) {
      isEdit.value = true
      form.value = {
        name: props.album.name || '',
        description: props.album.description || '',
        coverUrl: props.album.coverUrl || ''
      }
    } else {
      isEdit.value = false
      form.value = { name: '', description: '', coverUrl: '' }
    }
    // 清除上次的校验状态
    formRef.value?.clearValidate()
  }
})

// ===== 提交 =====
async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await updateAlbum(props.album.id, { ...form.value })
      ElMessage.success('影集编辑成功')
    } else {
      await createAlbum({ ...form.value })
      ElMessage.success('影集创建成功')
    }
    emit('success')
    emit('update:modelValue', false)
  } catch (e) {
    ElMessage.error(e.message || '操作失败，请重试')
  } finally {
    submitting.value = false
  }
}

function handleCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑影集' : '新建影集'"
    width="460px"
    :close-on-click-modal="false"
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="70px"
      label-position="left"
    >
      <el-form-item label="名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入影集名称"
          maxlength="50"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          placeholder="选填，简短描述一下这个影集"
          maxlength="200"
          show-word-limit
          :rows="3"
        />
      </el-form-item>

      <el-form-item label="封面图" prop="coverUrl">
        <el-input
          v-model="form.coverUrl"
          placeholder="选填，输入封面图片 URL"
        />
      </el-form-item>

    </el-form>

    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>
