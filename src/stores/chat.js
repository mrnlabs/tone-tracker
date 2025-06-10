import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { firebaseApp } from '@/firebase.js'
import { collection, addDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'

const db = useFirestore()

export const useChat = defineStore('chat', () => {
  
  async function sendMessage(payload) {
    console.log('payload', payload)
 
    const newDoc = await addDoc(collection(db, 'messages'), {
      payload,
    }).then(doc=> {
      console.log('doc', doc)
    })
  
    
  }

  return { sendMessage }
})
