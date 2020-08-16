<template>
  <div class="register-wrapper">
    <el-dialog :visible="visible" title="Register Account" @close="handleClose" @closed="resetForm">
      <el-form
        ref="register"
        :rules="rules"
        :model="form"
        label-position="right"
        label-width="80px"
        @keydown.enter.native="submit"
      >
        <el-form-item label="Username" prop="userID">
          <el-input v-model="form.userID" clearable></el-input>
        </el-form-item>
        <el-form-item label="Password" prop="password" clearable>
          <el-input v-model="form.password" show-password></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button type="primary" @click="submit" :loading="loading">Submit</el-button>
        <el-button @click="handleClose">Cancel</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { Form, FormItem } from 'element-ui';
import axios from 'axios';
import { errorMap } from '../../utils/common';
import md5 from 'md5';

export default {
  name: 'register',
  components: {
    ElForm: Form,
    ElFormItem: FormItem
  },
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    toggleVisible: {
      type: Function,
      required: true
    }
  },
  data() {
    const checkUserID = (rule, value, callback) => {
      if (!/^[a-zA-Z][a-zA-Z0-9_]{3,23}$/.test(value)) {
        callback(new Error('Illegal (beginning of letter + letter/number, length 4-24)'));
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
      loading: false
    };
  },
  methods: {
    submit() {
      this.$refs['register'].validate(valid => {
        if (valid) {
          this.register();
        }
      });
    },
    register() {
      this.loading = true;
      axios
        .post('https://im-demo.qcloud.com/register', {
          userid: this.form.userID,
          password: md5(this.form.password)
        })
        .then(({ data: { code, message } }) => {
          this.loading = false;
          if (code === 200) {
            this.$store.commit('showMessage', { type: 'success', message: 'Registration success' });
            this.toggleVisible(false);
            this.$emit('regist-success', {
              userID: this.form.userID,
              password: this.form.password
            });
          } else {
            this.$store.commit('showMessage', {
              message: 'Registration failed:' + errorMap[code] || message,
              type: 'error'
            });
          }
        })
        .catch(error => {
          this.loading = false;
          this.$store.commit('showMessage', {
            message: error.message,
            type: 'error'
          });
        });
    },
    handleClose() {
      if (this.visible) {
        this.toggleVisible(false);
      }
    },
    resetForm() {
      this.$refs['register'].resetFields();
    }
  }
};
</script>

<style lang="stylus" scoped>
/deep/ .el-dialog {
  width: 30%;
  margin: 0 auto;
}

@media screen and (max-width: 767px) {
  /deep/ .el-dialog {
    width: 80%;
    margin: 0 auto;
    margin-top: 0 !important;
  }

  /deep/ .el-dialog__wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
