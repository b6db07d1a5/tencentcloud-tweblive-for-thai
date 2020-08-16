import defaultImg from '../../assets/image/default.png'
const user = {
  state: {
    currentUserProfile: {},
    isLogin: false,
    isSDKReady: false, // TIM SDK ready
    userID: 0,
    userSig: '',
    sdkAppID: 0,
    errorImg: 'this.src="' + require('../../assets/image/default.png') + '"', //Handling method when loading picture error
    userInfo: {
      nickName: '',
      avatar: '',
      defaultImg: defaultImg
    },
  },
  mutations: {
    updateCurrentUserProfile(state, userProfile) {
      state.currentUserProfile = userProfile
    },
    toggleIsLogin(state, isLogin) {
      state.isLogin = typeof isLogin === 'undefined' ? !state.isLogin : isLogin
    },
    toggleIsSDKReady(state, isSDKReady) {
      state.isSDKReady = typeof isSDKReady === 'undefined' ? !state.isSDKReady : isSDKReady
    },
    reset(state) {
      Object.assign(state, {
        currentUserProfile: {},
        isLogin: false,
        isSDKReady: false
      })
    },
    GET_USER_INFO(state, payload) {
      state.userID = payload.userID
      state.userSig = payload.userSig
      state.sdkAppID = payload.sdkAppID
    },
  },
  actions: {
    // logout(context) {
    //   if (context.rootState.conversation.currentConversation.conversationID) {
    //     tim.setMessageRead({ conversationID: context.rootState.conversation.currentConversation.conversationID })
    //   }
    //   tim.logout().then(() => {
    //     context.commit('toggleIsLogin')
    //     context.commit('stopComputeCurrent')
    //     context.commit('reset')
    //   })
    // }
  }
}

export default user
