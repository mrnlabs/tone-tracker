<template>
  <div class="component-test">
    <h1>Component Test Page</h1>
    
    <div class="test-section">
      <h2>Rich Text Editor Test</h2>
      <RichTextEditor
        v-model="testText"
        label="Test Editor"
        placeholder="Type something here..."
        :max-length="500"
        :show-word-count="true"
      />
      <p>Content: {{ testText }}</p>
    </div>

    <div class="test-section">
      <h2>File Upload Test</h2>
      <FileUpload
        v-model="testFile"
        label="Test File Upload"
        accept=".pdf"
        :max-size="5 * 1024 * 1024"
        :store-only="true"
        @upload-success="handleUploadSuccess"
        @file-removed="handleFileRemoved"
      />
      <p v-if="testFile">File: {{ testFile.name }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import RichTextEditor from '@/components/form-components/RichTextEditor.vue'
import FileUpload from '@/components/form-components/FileUpload.vue'

const testText = ref('')
const testFile = ref(null)

const handleUploadSuccess = (result) => {
  console.log('Upload success:', result)
}

const handleFileRemoved = () => {
  console.log('File removed')
}
</script>

<style scoped>
.component-test {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 3rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.test-section h2 {
  margin-top: 0;
  color: #374151;
}
</style>