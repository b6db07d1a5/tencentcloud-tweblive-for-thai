<template>
  <div class="container-mobile">
    <div id="video-container" @click="showPanel" class="video-box" ref="video"></div>
    <div class="live-title">
      <span
        v-for="(item,index) in tabs"
        :key="index"
        class="title-item"
        :class="{active:isActive[index]}"
        @click="tabClick(index)"
      >{{item}}</span>
    </div>
    <div class="login-container" v-if="isLogin">
      <login />
    </div>
    <div ref="chat" class="chat">
      <NewChat v-show="!this.tabSelected" ref="live" />
      <div class="tab-summary" v-show="this.tabSelected">
        <p
          class="summary-text"
        >Tencent Cloud Web Live Interactive Component, based on Tencent Cloud Web Super Player-TcPlayer and Tencent Cloud Instant Messaging IM-TIM, encapsulates simple and easy-to-use APIs, and provides free and open source Demos to facilitate developers to quickly access and use. It is suitable for web live broadcast interactive scenes, such as online live broadcast of large-scale conferences, events, courses, lectures, etc., and WeChat H5 sharing with live broadcast of goods.</p>
        <p class="summary-text">Technical exchange QQ group: 468195767</p>
        <p class="summary-text">Welcome to raise an issue on github~</p>
        <p
          class="summary-text"
          style="font-size: 15px"
        >github: https://github.com/tencentyun/TWebLive</p>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Vue from 'vue';
import NewChat from './components/message/chat-mobile';
import Login from './components/user/login';
import MTA from './utils/mta';
import { isMobile } from './utils/mobile';
import { getUrlKey, isValidFlv } from './utils/common';
import bg from './assets/image/video-bg.png';

export default {
  title: 'TWebLive DEMO',
  components: {
    Login,
    NewChat
  },
  data() {
    return {
      isActive: [1, ''],
      showPlay: true,
      tabs: ['Interactive', 'Introduction'],
      tabSelected: 0,
      options: {
        flv: 'https://3891.liveplay.myqcloud.com/live/yqtest.flv',
        m3u8: 'https://3891.liveplay.myqcloud.com/live/yqtest.m3u8',
        autoplay: true,
        x5_type: 'h5',
        width: '100%',
        height: '230',
        poster: { style: 'cover', src: bg },
        pausePosterEnabled: false,
        wording: {
          1: 'The streamer is not here, lets chat in the live broadcast room~ ',
          2: 'The streamer is not here, lets chat in the live broadcast room~ ',
          4: 'The streamer is not here, lets chat in the live broadcast room~ ',
          13: 'The live broadcast you watched has ended',
          2032: 'Video request failed, please check the network',
          2048: 'Failed to request the m3u8 file, it may be a network error or a cross-domain problem'
        }
      },
      tweblive: null,
      isJoined: false,
      isMobile: isMobile()
    };
  },
  created() {
    let url = window.location.href;
    let roomId = getUrlKey('roomid', url);
    if (roomId) {
      this.$store.commit('setGroupId', roomId);
    }
    let flv = getUrlKey('flv', url);
    if (flv && isValidFlv(flv)) {
      let m3u8 = flv.replace('flv', 'm3u8');
      this.options.flv = flv;
      this.options.m3u8 = m3u8;
    }
  },
  computed: {
    ...mapState({
      chatInfo: state => state.conversation.chatInfo,
      currentMessageList: state => state.conversation.currentMessageList,
      userInfo: state => state.user.userInfo,
      isLogin: state => state.user.isLogin,
      isSDKReady: state => state.user.isSDKReady,
      userID: state => state.user.userID
    }),
    // Whether to display Loading status
    showLoading() {
      return !this.isJoined;
    }
  },

  mounted() {
    // Initialize the listener
    this.$nextTick(() => {
      const videoHeight = document.getElementById('video-container').clientHeight; //document.querySelector('video-container');
      let height = document.documentElement.clientHeight;
      if (videoHeight < height / 2) {
        //More than half the height
        this.$refs.chat.style.height = height - videoHeight + 'px';
      } else {
        this.$refs.chat.style.height = height - videoHeight + 'px';
      }
    });

    window.addEventListener('unload', () => {
      this.logout();
    });
    this.initListener();
  },

  watch: {
    isLogin(next) {
      if (next) {
        MTA.clickStat('link_two', { show: 'true' });
      }
    }
  },

  methods: {
    tabClick(index) {
      // window.scroll(0, 0)    //Switch tab, the chat area slides to the bottom
      this.isActive = ['', ''];
      this.isActive[index] = 1;
      this.tabSelected = index;
      this.$nextTick(() => {
        this.$refs.live.keepMessageListOnButtom();
      });
    },
    initListener() {
      const tweblive = new this.TWebLive({
        SDKAppID: 1400187352,
        domID: 'video-container',
        ...this.options
      });
      this.tweblive = tweblive;
      window.tweblive = tweblive;
      Vue.prototype.tweblive = tweblive;
      this.enterRoom();

      this.tweblive.on(this.TWebLive.EVENT.IM_READY, this.onReadyStateUpdate);
      this.tweblive.on(this.TWebLive.EVENT.KICKED_OUT, this.onKickedOut);
      this.tweblive.on(this.TWebLive.EVENT.ERROR, this.onError);
      this.tweblive.on(this.TWebLive.EVENT.CUSTOM_MESSAGE_RECEIVED, this.onCustomMessageReceived);
      this.tweblive.on(this.TWebLive.EVENT.TEXT_MESSAGE_RECEIVED, this.onTextMessageReceived);
      this.tweblive.on(this.TWebLive.EVENT.REMOTE_USER_JOIN, this.onRemoteUserJoin);
      this.tweblive.on(this.TWebLive.EVENT.REMOTE_USER_LEAVE, this.onRemoteUserLeave);
      this.tweblive.on(this.TWebLive.EVENT.NET_STATE_CHANGE, this.onNetStateChange);
      this.tweblive.on(this.TWebLive.EVENT.ENDED, this.onLiveEnd);
    },
    onTextMessageReceived({ data: messageList }) {
      messageList.forEach(message => {
        const userName = message.nick || message.from;
        const avatar = message.avatar || this.userInfo.defaultImg;
        message.nick = userName;
        message.avatar = avatar;
      });
      this.$store.commit('pushCurrentMessageList', messageList);
    },
    onCustomMessageReceived({ data: messageList }) {
      this.$store.commit('showLike', messageList.length);
    },
    onRemoteUserJoin({ data: messageList }) {
      messageList.forEach(function (message) {
        const userName = message.nick || message.payload.userIDList[0];
        message.payload.text = `${userName} 来了`;
        // message.type = 'Live-tips'
      });
      this.$store.commit('pushCurrentTipsList', messageList);
    },
    onRemoteUserLeave({ data: messageList }) {
      messageList.forEach(function (message) {
        const userName = message.nick || message.payload.userIDList[0];
        message.payload.text = `${userName} 走了`;
        // message.type = 'Live-tips'
      });
      this.$store.commit('pushCurrentTipsList', messageList);
    },
    onError({ data }) {
      if (data.message !== '' && data.message !== 'Network Error') {
        // this.$store.commit('showMessage', {
        //   message: data.message,
        //   type: 'error'
        // })
      }
    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TWebLive.EVENT.IM_READY ? true : false;
      this.$store.commit('toggleIsSDKReady', isSDKReady);

      if (isSDKReady) {
        this.enterRoom();
        this.getMyProfile();
      }
    },
    getMyProfile() {
      this.tweblive
        .getMyProfile()
        .then(res => {
          this.userInfo.nickName = res.data.nick || this.userID;
          this.userInfo.avatar = res.data.avatar || this.userInfo.defaultImg;
        })
        .catch(() => {
          // console.log('getMyProfile error:', imError)
        });
    },

    enterRoom() {
      this.tweblive
        .enterRoom(this.chatInfo.groupId)
        .then(() => {
          this.isJoined = true;
        })
        .catch(imError => {
          if (imError.code === 10007 || imError.code === 10015) {
            this.$store.commit('showMessage', {
              type: 'error',
              message: 'The live broadcast room you joined does not exist~'
            });
          }
        });
    },
    exitRoom() {
      this.tweblive.exitRoom(this.chatInfo.groupId).then(() => {
        this.isJoined = false;
      });
    },
    kickedOutReason(type) {
      switch (type) {
        case this.TWebLive.TYPES.KICKED_OUT_MULT_ACCOUNT:
          return 'Due to multi-instance login';
        case this.TWebLive.TYPES.KICKED_OUT_MULT_DEVICE:
          return 'Due to multi-device login';
        case this.TWebLive.TYPES.KICKED_OUT_USERSIG_EXPIRED:
          return 'Due to userSig expired';
        default:
          return '';
      }
    },

    checkoutNetState(state) {
      switch (state) {
        case this.TWebLive.TYPES.NET_STATE_CONNECTED:
          return { message: 'Connected to the network', type: 'success' };
        case this.TWebLive.TYPES.NET_STATE_CONNECTING:
          return { message: 'The current network is unstable', type: 'warning' };
        case this.TWebLive.TYPES.NET_STATE_DISCONNECTED:
          return { message: 'The current network is unavailable', type: 'error' };
        default:
          return '';
      }
    },
    login() {
      this.$store.commit('toggleIsLogin', true);
      // this.$emit()
    },
    _logout() {
      this.tweblive.logout().then(() => {
        this.$store.commit('toggleIsSDKReady', false);
        this.$store.commit('showMessage', { type: 'success', message: 'exit successfully' });
      });
    },
    async logout() {
      if (this.isSDKReady) {
        await this.exitRoom();
        await this._logout();
        this.enterRoom();
      }
    },
    onLiveEnd() {
      this.$store.commit('showMessage', { type: 'warning', message: 'Live broadcast is over' });
    },
    onNetStateChange(event) {
      this.$store.commit('showMessage', this.checkoutNetState(event.data));
    },
    showPanel() {
      let el = document.getElementsByClassName('vcp-controls-panel')[0];
      el.setAttribute('class', 'vcp-controls-panel show'); //设置元素class
    },
    onKickedOut(event) {
      this.$store.commit('showMessage', {
        message: `${this.kickedOutReason(event.data.type)}Was kicked out, please log in again.`,
        type: 'error'
      });
      this.$store.commit('toggleIsLogin', true);
      this.$store.commit('reset');
    }
  }
};
</script>

<style scoped lang="stylus">
.container-mobile {
  margin: 0 auto;
  overflow: hidden;

  .video-box {
    position: relative;
    overflow: hidden;
  }

  .live-title {
    display: flex;
    justify-content: center;
    height: 40px;
    line-height: 40px;
    color: #ffffff;
    text-align: center;
    margin: 0 auto;
    border-bottom: 2px solid rgb(0, 0, 0, 0.8);
    font-size: 16px;

    .title-item {
      display: block;
      width: 50px;
      margin: 0 40px;
    }
  }

  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    // padding-top: 100px;
  }

  .chat {
    display: flex;
    justify-content: center;
    position: relative;
    height: auto;

    .summary-text {
      padding: 5px 20px;
      line-height: 25px;
      color: #ffffff;
    }
  }
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.active {
  border-bottom: 2px solid #f5a623;
  color: #f5a623;
}

/deep/ .vcp-player {
  width: 100%;
  position: relative;
}

/deep/ .vcp-bigplay {
  display: none;
}

/deep/ .vcp-error-tips {
  color: #FFFFFF;
  margin-top: -4.25em;
}

/deep/ .vcp-panel-bg {
  opacity: 0.5;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
