<script setup>

import { useTextareaAutosize } from '@vueuse/core';
import useToaster from '@/composables/useToaster';
import { reactive, ref, watch } from 'vue'
import { useSpeechRecognition } from '@vueuse/core';
import { useChat } from '@/stores/chat';

const { textarea, input } = useTextareaAutosize();
const { success, error } = useToaster()

const lang = ref('en-US');

const chatStore = useChat();

const speech = useSpeechRecognition({
  lang,
  continuous: true,
})
const msgForm = reactive({
  userId: '1',
  msg: ''
})


if (speech.isSupported.value) {
  const SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList
  const speechRecognitionList = new SpeechGrammarList();
}


function start() {
  speech.result.value = ''
  speech.start()
}
const sendMessage = () => {
  console.log(msgForm)
  if(!msgForm.msg) return
  chatStore.sendMessage(msgForm)
}
const { isListening, isSupported, stop, result } = speech
let inputValue = result

const selectedLanguage = ref(lang.value)
watch(lang, lang => isListening.value ? null : selectedLanguage.value = lang)
watch(isListening, isListening => isListening ? null : selectedLanguage.value = lang.value)
</script>
<template>
    <div class="chat-footer d-flex align-items-center">
        <div class="flex-grow-1 pe-2">
            <div class="input-group">	<span class="input-group-text"><i class='bx bx-smile'></i></span>
                <!-- <input type="text" class="form-control" placeholder="Type a message"> -->
                <textarea
                ref="textarea"
                v-model="msgForm.msg"
                class="form-control"
                placeholder="What's on your mind?"
              />
            </div>
        </div>
        <div class="chat-footer-menu"> <a @click="sendMessage" href="javascript:;"><i class='bx bx-send'></i></a>
            <a href="javascript:;"><i class='bx bxs-contact'></i></a>
            <a v-if="!isListening" @click="start" href="javascript:;"><i class='bx bx-microphone'></i></a>
            <a href="javascript:;"><i class='bx bx-dots-horizontal-rounded'></i></a>
        </div>
    </div>
</template>