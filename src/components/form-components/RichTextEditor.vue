<template>
  <div class="rich-text-editor">
    <div class="editor-header">
      <label v-if="label" :class="['editor-label', { required: required }]">
        {{ label }}
      </label>
    </div>
    
    <!-- Toolbar for formatting options -->
    <div class="formatting-toolbar">
      <div class="toolbar-section">
        <Button
          @click="insertText('**', '**')"
          icon="pi pi-bold"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Bold'"
        />
        <Button
          @click="insertText('*', '*')"
          icon="pi pi-italic"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Italic'"
        />
        <Button
          @click="insertText('~~', '~~')"
          class="p-button-outlined p-button-sm strikethrough-btn"
          v-tooltip.bottom="'Strikethrough'"
        >
          <span style="text-decoration: line-through;">S</span>
        </Button>
      </div>
      <div class="toolbar-section">
        <Button
          @click="insertText('# ', '')"
          label="H1"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Heading 1'"
        />
        <Button
          @click="insertText('## ', '')"
          label="H2"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Heading 2'"
        />
        <Button
          @click="insertText('### ', '')"
          label="H3"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Heading 3'"
        />
      </div>
      <div class="toolbar-section">
        <Button
          @click="insertText('- ', '')"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Bullet List'"
        >
          <span style="font-weight: bold;">•</span>
        </Button>
        <Button
          @click="insertText('1. ', '')"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Numbered List'"
        >
          <span style="font-weight: bold;">1.</span>
        </Button>
        <Button
          @click="insertText('[Link Text](URL)', '')"
          icon="pi pi-link"
          class="p-button-outlined p-button-sm"
          v-tooltip.bottom="'Insert Link'"
        />
      </div>
    </div>
    
    <div class="editor-container">
      <Textarea
        ref="textareaRef"
        v-model="localValue"
        :placeholder="placeholder"
        :class="{ 'p-invalid': !!error }"
        @input="handleChange"
        :rows="8"
        :maxlength="maxLength"
        class="enhanced-textarea"
      />
    </div>
    
    <!-- Live Preview -->
    <div v-if="localValue && showPreview" class="preview-section">
      <div class="preview-header">
        <span class="preview-label">Preview:</span>
        <Button
          @click="showPreview = false"
          icon="pi pi-eye-slash"
          class="p-button-text p-button-sm"
          v-tooltip.bottom="'Hide Preview'"
        />
      </div>
      <div class="preview-content" v-html="formattedContent"></div>
    </div>
    
    <div class="editor-footer">
      <div class="footer-left">
        <small v-if="error" class="error-message">{{ error }}</small>
      </div>
      <div class="footer-right">
        <Button
          v-if="localValue && !showPreview"
          @click="showPreview = true"
          icon="pi pi-eye"
          label="Preview"
          class="p-button-text p-button-sm"
        />
        <div class="editor-info">
          <span v-if="maxLength" class="character-count">
            {{ characterCount }}/{{ maxLength }}
          </span>
          <span v-if="showWordCount" class="word-count">
            {{ wordCount }} words
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Enter text...'
  },
  required: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  maxLength: {
    type: Number,
    default: null
  },
  showWordCount: {
    type: Boolean,
    default: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const localValue = ref(props.modelValue)
const textareaRef = ref(null)
const showPreview = ref(false)

// Computed properties for text analysis
const characterCount = computed(() => {
  if (!localValue.value) return 0
  return localValue.value.length
})

const wordCount = computed(() => {
  if (!localValue.value) return 0
  const words = localValue.value.trim().split(/\s+/)
  return words.filter(word => word.length > 0).length
})

// Convert markdown-like text to HTML for preview
const formattedContent = computed(() => {
  if (!localValue.value) return ''
  
  let html = localValue.value
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')
  
  // Bold and italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/~~(.*?)~~/g, '<del>$1</del>')
  
  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  
  // Lists (simple implementation)
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.*$)/gim, '<li>$1. $2</li>')
  
  return html
})

// Insert formatting at cursor position
const insertText = (before, after) => {
  const textarea = textareaRef.value?.$el
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = localValue.value.substring(start, end)
  
  const beforeText = localValue.value.substring(0, start)
  const afterText = localValue.value.substring(end)
  
  localValue.value = beforeText + before + selectedText + after + afterText
  
  // Set cursor position after inserted text
  setTimeout(() => {
    textarea.focus()
    const newCursorPos = start + before.length + selectedText.length + after.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
  }, 0)
  
  handleChange()
}

// Handle changes
const handleChange = () => {
  emit('update:modelValue', localValue.value)
  emit('change', localValue.value)
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue
  }
})
</script>

<style scoped>
.rich-text-editor {
  width: 100%;
}

.editor-header {
  margin-bottom: 0.5rem;
}

.editor-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.editor-label.required::after {
  content: ' *';
  color: #ef4444;
}

.formatting-toolbar {
  display: flex;
  gap: 1rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  flex-wrap: wrap;
}

.toolbar-section {
  display: flex;
  gap: 0.25rem;
}

.editor-container {
  border-radius: 0 0 6px 6px;
  overflow: hidden;
}

.enhanced-textarea {
  width: 100%;
  border-radius: 0 0 6px 6px;
  border-top: none;
  resize: vertical;
  min-height: 150px;
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
}

.enhanced-textarea :deep(.p-inputtextarea) {
  width: 100%;
}

.enhanced-textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 1px #3b82f6;
}

.enhanced-textarea.p-invalid {
  border-color: #ef4444;
}

.preview-section {
  margin-top: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.preview-label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.preview-content {
  padding: 1rem;
  background: white;
  line-height: 1.6;
  color: #374151;
}

.preview-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: #111827;
}

.preview-content h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.75rem 0;
  color: #111827;
}

.preview-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0.75rem 0 0.5rem 0;
  color: #111827;
}

.preview-content strong {
  font-weight: 600;
  color: #111827;
}

.preview-content em {
  font-style: italic;
}

.preview-content del {
  text-decoration: line-through;
  color: #6b7280;
}

.preview-content a {
  color: #3b82f6;
  text-decoration: underline;
}

.preview-content li {
  margin-bottom: 0.25rem;
}

.editor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.footer-left {
  flex: 1;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.error-message {
  color: #ef4444;
  font-size: 0.875rem;
}

.editor-info {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.character-count,
.word-count {
  font-family: monospace;
}

/* Responsive design */
@media (max-width: 640px) {
  .formatting-toolbar {
    gap: 0.5rem;
  }
  
  .toolbar-section {
    gap: 0.125rem;
  }
  
  .footer-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
  }
}
</style>