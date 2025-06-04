import { defineStore } from 'pinia'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    text: '',
  }),
  actions: {
    setText(content: string) {
      this.text = content
    },
    clear() {
      this.text = ''
    },
  },
})
