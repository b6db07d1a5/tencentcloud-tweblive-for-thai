const conversationModules = {
  state: {
    currentMessageList: [],
    currentLiveTips: [],
    chatInfo: {
      groupId: 'TWebLiveDeveloperHub',
      userId: '',
      userSig: '',
      sdkAppID: ''
    },
    likeCount: 0     //Likes
  },
  getters: {

  },
  mutations: {

    setGroupId(state, data) {
      state.chatInfo.groupId = data
    },
    showLike(state, data) {
      state.likeCount += data
    },
    /**
     * Insert message into current conversation list
     * Calling time: when the receiving/sending message event is triggered
     * @param {Object} state
     * @param {Message[]|Message} data
     * @returns
     */
    pushCurrentMessageList(state, data) {
      if (Array.isArray(data)) {
        state.currentMessageList = [...state.currentMessageList, ...data]
      } else {
        state.currentMessageList = [...state.currentMessageList, data]
      }
    },
    pushCurrentTipsList(state, data) {
      let timer = null
      if (Array.isArray(data)) {
        state.currentLiveTips = [...state.currentLiveTips, ...data]
      } else {
        state.currentLiveTips = [...state.currentLiveTips, data]
      }
      timer = setTimeout(() => {
        state.currentLiveTips.shift()
      }, 2000)
      if (state.currentLiveTips.length === 0) {
        clearTimeout(timer)
      }
    },
    /**
     * Delete a message from the current message list
     * @param {Object} state
     * @param {Message} message
     */
    reset(state) {
      Object.assign(state, {
        currentMessageList: [],
        currentLiveTips: [],
      })
    }
  },
  actions: {

  }
}

export default conversationModules
