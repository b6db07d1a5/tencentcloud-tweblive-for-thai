<template>
  <div class="login-container">
    <div class="login-wrapper">
      <img class="close" :src="close" @click="closeLogin" />
      <img class="logo" :src="logo" />
      <el-form
        ref="login"
        :rules="rules"
        :model="form"
        label-width="0"
        style="width:100%;"
        @keydown.enter.native="submit"
      >
        <el-form-item prop="userID">
          <el-input
            v-model="form.userID"
            placeholder="Please enter user name"
            type="text"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            placeholder="Please enter password"
            @focus="handleMobileInputFocus"
            @blur="handleMobileInputBlur"
            type="password"
            show-password
            clearable
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button
        type="primary"
        @click="submit"
        style="width:100%; margin-top: 6px;"
        :loading="loading"
      >Log in</el-button>
      <el-button
        class="register-button"
        @click="registerVisible = true"
        style="width:100%; margin-top: 6px;magin-left:0px;"
      >Registered</el-button>
      <register
        :visible="registerVisible"
        :toggleVisible="toggleRegisterVisible"
        @regist-success="handleRegistSuccess"
      />
    </div>
  </div>
</template>

<script>
import { Form, FormItem } from 'element-ui';
import axios from 'axios';
import close from '../../assets/image/close-login.png';
import logo from '../../assets/image/logo.png';
import Register from './register';
import { errorMap } from '../../utils/common';
import { mapState } from 'vuex';
import md5 from 'md5';
export default {
  name: 'Login',
  components: {
    ElForm: Form,
    ElFormItem: FormItem,
    Register
  },
  data() {
    const checkUserID = (rule, value, callback) => {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{3,23}$/.test(value)) {
        callback(new Error('Illegal (beginning of letter + letter/number, length 4-24'));
      } else {
        callback();
      }
    };
    return {
      form: {
        userID: '',
        password: ''
      },
      rules: {
        userID: [
          { required: true, message: 'Please enter userID', trigger: 'blur' },
          { validator: checkUserID, trigger: 'blur' }
        ],
        password: [{ required: true, message: 'Please enter password', trigger: 'blur' }]
      },
      logo: logo,
      close: close,
      registerVisible: false,
      loading: false
    };
  },
  computed: {
    ...mapState({
      chatInfo: state => state.conversation.chatInfo
    })
  },
  methods: {
    handleMobileInputFocus() {
      window.scroll(0, 0);
      // setTimeout(()=>{
      // },200)
    },
    handleMobileInputBlur() {
      this.$nextTick(() => {
        window.scroll(0, 0);
      });
      // if(isIOS()) {
      //   this.$nextTick(() => {
      //     window.scrollTo(0, 0);
      //   });
      // }
    },
    submit() {
      this.$refs['login'].validate(valid => {
        if (valid) {
          this.login();
        }
      });
    },
    closeLogin() {
      this.$store.commit('toggleIsLogin', false);
    },
    login() {
      this.exitRoom();
      this.loading = true;
      // 1. Request exchange userSig
      axios({
        url: 'https://im-demo.qcloud.com/login',
        method: 'POST',
        data: { userid: this.form.userID, password: md5(this.form.password) }
        // headers: {
        //   'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        // }
      })
        .then(({ data: { code, data }, data: response }) => {
          if (code === 200) {
            this.$store.commit({
              type: 'GET_USER_INFO',
              userID: this.form.userID,
              userSig: data.im_userSig_info.userSig,
              sdkAppID: data.im_userSig_info.sdkAppID
            });
            // 2. Call TIM SDK login interface
            return this.tweblive.login({
              userID: this.form.userID,
              userSig: data.im_userSig_info.userSig
            });
          } else {
            throw response;
          }
        })
        .then(() => {
          this.loading = false;
          this.$store.commit('toggleIsLogin', false);
          // this.$store.commit('startComputeCurrent')
          this.$store.commit('showMessage', { type: 'success', message: 'Login successful' });
        })
        .catch(error => {
          this.loading = false;
          let message = '';
          if (error.code) {
            message = errorMap[error.code];
          } else {
            message = error.message;
          }
          this.$store.commit('showMessage', {
            message: 'Login failed:' + message,
            type: 'error'
          });
        });
    },
    exitRoom() {
      this.tweblive.exitRoom(this.chatInfo.groupId).then(() => {});
    },
    toggleRegisterVisible(visible) {
      this.registerVisible = typeof visible !== 'undefined' ? visible : !this.registerVisible;
    },
    handleRegistSuccess({ userID, password }) {
      this.form.userID = userID;
      this.form.password = password;
    }
  }
};
</script>

<style lang="stylus" scoped>
.login-container {
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  justify-content: center;
  align-items: center;
  display: flex;
}

.close {
  display: block;
  width: 20px;
  height: 20px;
  position: absolute;
  right: 10px;
  top: 10px;
}

.login-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 300px;
  padding: 20px 80px 50px;
  background: $white;
  color: $black;
  border-radius: 5px;
  box-shadow: 0 11px 20px 0 rgba(0, 0, 0, 0.3);

  .logo {
    width: 130px;
    height: 130px;
  }

  .register-button {
    width: 100%;
    margin: 6px 0 0 0;
  }
}

@media screen and (max-width: 767px) {
  .login-wrapper {
    width: 65%;
    padding: 20px 30px 20px;

    .logo {
      width: 80px;
      height: 80px;
    }
  }

  .el-form-item {
    margin-bottom: 10px;
  }
}
</style>
