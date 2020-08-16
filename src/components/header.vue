<template>
  <div>
    <el-dialog title="Edit profile" :visible.sync="showEditMyProfile" width="80%">
      <el-form v-model="form" label-width="100px">
        <el-form-item label="Avatar">
          <el-input v-model="form.avatar" placeholder="Avatar address(URL)" />
        </el-form-item>
        <el-form-item label="Nickname">
          <el-input v-model="form.nick" placeholder="Nickname" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditMyProfile = false">Cancel</el-button>
        <el-button type="primary" @click="setMyProfile">Set Profile</el-button>
      </span>
    </el-dialog>
    <div class="direct-one">
      <div class="direct-security">
        <div class="direct-one-zhibo">
          <img src="../assets/image/video.png" alt class="picture-png" />Tencent Cloud Web Live Interactive Component
        </div>
        <div class="rel">
          <div class="to-login" v-if="!isSDKReady" @click="login">Log In</div>
          <el-dropdown v-else @command="handleCommand">
            <div style="display: flex">
              <img class="header-img" :src="userInfo.avatar" />
              <span class="header-text">{{userInfo.nickName}}</span>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="setProfile">Set Profile</el-dropdown-item>
              <el-dropdown-item command="outLogin">Log Out</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
export default {
  name: 'Header',
  data() {
    return {
      showEditMyProfile: false,
      form: { avatar: '', nick: '' }
    };
  },
  computed: {
    ...mapState({
      chatInfo: state => state.conversation.chatInfo,
      userInfo: state => state.user.userInfo,
      isLogin: state => state.user.isLogin,
      isSDKReady: state => state.user.isSDKReady,
      userID: state => state.user.userID
    })
  },
  methods: {
    login() {
      this.$store.commit('toggleIsLogin', true);
      // this.$emit()
    },
    handleCommand(command) {
      if (command === 'setProfile') {
        this.showEditMyProfile = true;
      }
      if (command === 'outLogin') {
        this.open();
      }
    },
    open() {
      this.$confirm('Are you sure you want to log out?', 'Prompt', {
        confirmButtonText: 'Ok',
        cancelButtonText: 'Cancel',
        type: 'warning'
      })
        .then(() => {
          this.$emit('logout');
        })
        .catch(() => {
          this.$store.commit('showMessage', {
            message: 'Canceled logout',
            type: 'info'
          });
        });
    },
    setMyProfile() {
      if (this.form.avatar && this.form.avatar.indexOf('http') === -1) {
        this.$store.commit('showMessage', {
          message: 'The avatar should be a URL address',
          type: 'warning'
        });
        this.form.avatar = '';
        return;
      }
      const options = {};
      // Filter empty strings
      Object.keys(this.form).forEach(key => {
        if (this.form[key]) {
          options[key] = this.form[key];
        }
      });
      this.tweblive
        .setMyProfile(options)
        .then(imResponse => {
          this.$store.commit('showMessage', {
            message: 'Successfully modified'
          });
          this.userInfo.nickName = imResponse.data.nick;
          this.userInfo.avatar = imResponse.data.avatar;
          this.showEditMyProfile = false;
        })
        .catch(imError => {
          this.$store.commit('showMessage', {
            message: imError.message,
            type: 'error'
          });
        });
    }
  }
};
</script>

<style lang="stylus" scoped>
/deep/ .el-dialog {
  max-width: 460px;
}

.direct-one {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #2F3035;
  height: 60px;
  line-height: 60px;
}

.direct-security {
  margin: 0 auto;
  justify-content: space-between;
  display: flex;
  width: 90%;
}

.direct-one-zhibo {
  color: #fff;
  font-size: 18px;
  width: 800px;
}

.picture-png {
  display: inline-block;
  width: 24px;
  height: 24px;
  vertical-align: middle;
  padding-right: 10px;
}

.rel {
  height: 36px;
  background: #2f3035;
  border-radius: 20px;
  align-self: center;
  cursor: pointer;

  .header-img {
    display: block;
    width: 32px;
    height: 32px;
    margin: 2px 0;
    border-radius: 50%;
    vertical-align: middle;
  }

  .header-text {
    color: #ffffff;
    line-height: 36px;
    font-size: 16px;
    padding-left: 5px;
  }
}

.rel .to-login {
  line-height: 36px;
  width: 80px;
  height: 100%;
  background: rgba(0, 132, 255, 1);
  border-radius: 19px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all ease 0.3s;
}

@media screen and (min-width: 900px) and (max-width: 1500px) {
  .direct-security {
    width: 85%;
  }
}

@media screen and (min-width: 1500px) {
  .direct-security {
    width: 70%;
  }
}
</style>
