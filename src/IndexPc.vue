<template>
  <div class="live-pc">
    <Header @logout="logout" />
    <div class="top-box">
      <svg
        @click="showMobile"
        t="1591255158096"
        class="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        p-id="2653"
        width="32"
        height="32"
      >
        <path
          d="M754.9 64.4H269.1c-10.3 0-18.7 8.4-18.7 18.7v857.8c0 10.3 8.4 18.7 18.7 18.7h485.7c10.3 0 18.7-8.4 18.7-18.7V83.1c0.1-10.3-8.3-18.7-18.6-18.7z m-18.7 37.4v721.6H287.8V101.8h448.4zM475 875.9c0-19.3 15.7-35 35-35s35 15.7 35 35-15.7 35-35 35c-19.3 0.1-35-15.6-35-35z"
          fill="#ffffff"
          p-id="2654"
        />
      </svg>
      <span @click="showMobile" style="color: #ffffff">Mobile watch</span>
    </div>
    <!--        <div>时间</div>-->
    <el-dialog title="WeChat watch" :visible.sync="mobileImg" width="30%" center>
      <QRCode class="mobile-Live" />
      <!--            <img class="mobile-Live" src="../src/assets/image/qrcode.png"/>-->
    </el-dialog>
    <div class="container-pc">
      <div id="video-container" class="video-container"></div>
      <div id="login-container" v-if="isLogin">
        <login />
      </div>
      <div class="chat-container">
        <NewChat />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Vue from 'vue';
import QRCode from './components/qrcode';
import NewChat from './components/message/chat-room';
import Login from './components/user/login';
import Header from './components/header';
import MTA from './utils/mta';
import { isMobile } from './utils/mobile';
import { getUrlKey, isValidFlv } from './utils/common';
import bg from './assets/image/video-bg.png';
export default {
  title: 'TWebLive DEMO',
  components: {
    Login,
    Header,
    NewChat,
    QRCode
  },
  data() {
    return {
      options: {
        flv: 'http://live.thairath.xyz/live/hubba.m3u8',
        m3u8: 'http://live.thairath.xyz/live/hubba.m3u8',
        autoplay: true,
        width: '100%',
        height: 'auto',
        poster: { style: 'cover', src: bg },
        pausePosterEnabled: false,
        wording: {
          1: 'The anchor is not here, lets chat in the live broadcast room~',
          2: 'The anchor is not here, lets chat in the live broadcast room~',
          4: 'The anchor is not here, lets chat in the live broadcast room~',
          13: 'The live broadcast you watched has ended',
          2032: 'Failed to request video, please check the network',
          2048: 'Request for m3u8 file failed, it may be a network error or cross-domain issue'
        }
      },
      tweblive: null,
      isJoined: false,
      isMobile: isMobile(),
      mobileImg: false
    };
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
    // 是否显示 Loading 状态
    showLoading() {
      return !this.isJoined;
    }
  },
  created() {
    let roomId = getUrlKey('roomid');
    if (roomId) {
      this.$store.commit('setGroupId', roomId);
    }
    let flv = getUrlKey('flv');
    if (flv && isValidFlv(flv)) {
      let m3u8 = flv.replace('flv', 'm3u8');
      this.options.flv = flv;
      this.options.m3u8 = m3u8;
    }
  },
  mounted() {
    this.initListener();

    // this.logout()
    window.addEventListener('beforeunload', () => {
      this.logout();
    });
  },

  watch: {
    isLogin(next) {
      if (next) {
        MTA.clickStat('link_two', { show: 'true' });
      }
    }
  },

  methods: {
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
      // messageList.forEach(() => {
      //   this.$store.commit('showLike',1)
      // })
    },
    onRemoteUserJoin({ data: messageList }) {
      messageList.forEach(function (message) {
        const userName = message.nick || message.payload.userIDList[0];
        message.payload.text = `Welcome ${userName} Enter the live room `;
        message.type = 'Live-Join';
      });
      if (this.isSDKReady) {
        this.$store.commit('pushCurrentMessageList', messageList);
      }
    },
    onLiveEnd() {
      this.$store.commit('showMessage', { type: 'warning', message: '直播已结束' });
    },
    onRemoteUserLeave({ data: messageList }) {
      messageList.forEach(function (message) {
        const userName = message.nick || message.payload.userIDList[0];
        message.payload.text = `${userName} Left the live broadcast room`;
        message.type = 'Live-Leave';
      });
      this.$store.commit('pushCurrentMessageList', messageList);
    },
    onError({ data }) {
      if (data.message !== '' && data.message !== 'Network Error') {
        // this.$store.commit('showMessage', {
        //   message: data.message,
        //   type: 'error'
        // })
      }
    },
    showMobile() {
      this.mobileImg = true;
    },
    onReadyStateUpdate({ name }) {
      const isSDKReady = name === this.TWebLive.EVENT.IM_READY ? true : false;
      this.$store.commit('toggleIsSDKReady', isSDKReady);

      if (isSDKReady) {
        this.enterRoom();
        this.getMyProfile();
      }
    },
    enterRoom() {
      this.tweblive
        .enterRoom(this.chatInfo.groupId)
        .then(() => {
          this.isJoined = true;
        })
        .catch(imError => {
          if (imError.code === 10007 || imError.code === 10015) {
            this.$store.commit('showMessage', { type: 'error', message: '你加入的直播间不存在哦~' });
          }
        });
    },
    exitRoom() {
      this.tweblive.exitRoom(this.chatInfo.groupId).then(() => {
        this.isJoined = false;
      });
    },
    getMyProfile() {
      this.tweblive
        .getMyProfile()
        .then(res => {
          this.userInfo.nickName = res.data.nick || this.userID;
          this.userInfo.avatar = res.data.avatar || this.userInfo.defaultImg;
        })
        .catch(() => {
          // console.warn('getMyProfile error:', imError)
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
    _logout() {
      this.tweblive.logout().then(() => {
        this.$store.commit('toggleIsSDKReady', false);
        // this.$store.commit('reset')
        this.$store.commit('showMessage', { type: 'success', message: '退出成功' });
      });
    },

    async logout() {
      if (this.isSDKReady) {
        await this.exitRoom();
        await this._logout();
        this.enterRoom();
      }
    },
    onNetStateChange(event) {
      this.$store.commit('showMessage', this.checkoutNetState(event.data));
    },
    onKickedOut(event) {
      this.$store.commit('showMessage', {
        message: `${this.kickedOutReason(event.data.type)}Kicked out, please log in again。`,
        type: 'error'
      });
      this.$store.commit('toggleIsLogin', true);
      this.$store.commit('reset');
    }
  }
};
</script>

<style scoped lang="stylus">
.live-pc {
  width: 90%;
  margin: 0 auto;
  height: 32px;

  .top-box {
    color: #ffffff;
    margin: 80px 0 20px 0;
    cursor: pointer;

    & span {
      color: #E4E4E4;
      height: 32px;
      line-height: 32px;
      font-size: 14px;
      vertical-align: top;
    }
  }

  .container-pc {
    // padding-top 100px    //头部，后续加
    position: relative;
    display: flex;

    .video-container {
      float: left;
      flex: 1;
      min-width: 600px;
      height: 80vh;
    }

    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      // padding-top: 100px;
    }

    .chat-container {
      position: relative;
      width: 360px;
      background: #000; // #141520
      color: #ffffff;
      margin-left: 10px;
      border-radius: 5px 5px 0 0;
    }
  }
}

// 手机二维码
.el-dialog__wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

/deep/ .el-dialog--center {
  margin: 0 !important;
  width: 360px !important;
  padding: 5px 0;
}

/deep/ .el-dialog__title {
  color: #1A8CFF;
  font-size: 16px;
}

.mobile-Live {
  display: block;
  margin: 0 auto;
  /* width 60px */
  /* height 60px */
}

/deep/ .el-dialog--center .el-dialog__body {
  padding: 0px 25px 25px;
}

// 修改视频样式
/deep/ .vcp-player video {
  /* background-color #141520 */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/deep/ .vcp-player {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

/deep/ .vcp-bigplay {
  display: none;
}

/deep/ .vcp-error-tips {
  color: #FFFFFF;
  margin-top: -8.25em;
}

@media screen and (max-width: 1000px) {
  .container-pc {
    overflow-x: auto;
  }
}

@media screen and (min-width: 1200px) and (max-width: 1500px) {
  .live-pc {
    width: 85%;
  }
}

@media screen and (min-width: 1500px) {
  .live-pc {
    width: 70%;
  }
}
</style>
