<template>
  <div id="chartroom">
    <div>
      <div style="float: left">{{name}} 你好!</div>
      <b-button style="float: right" v-b-modal.modal-prevent-closing >修改昵称</b-button>
      <b-modal
        id="modal-prevent-closing"
        ref="modal"
        title="Submit Your Name"
        @show="resetModal"
        @hidden="resetModal"
        @ok="handleOk"
        v-model="modalShow"
      >
        <form ref="form" @submit.stop.prevent="handleSubmit">
          <b-form-group
            :state="nameState"
            label="Name"
            label-for="name-input"
            invalid-feedback="Name is required"
          >
            <b-form-input
              id="name-input"
              v-model="inputname"
              :state="nameState"
              required
            ></b-form-input>
          </b-form-group>
        </form>
      </b-modal>
    </div>
    <b-container class="bv-example-row" id="messages" v-bind:style="{height: height - 90 + 'px'}">
      <div v-for="msg in msglist" :key="msg.id" :class="msg.user">
        <span>
          {{ msg.msg }}
        </span>
      </div>
    </b-container>
    <b-input-group class="mt-3">
      <b-form-input v-model="sendmessage"></b-form-input>
      <b-button variant="success" @click="sendmsg">发送</b-button>
      <b-button variant="secondary" @click="clearmsg">清空</b-button>
    </b-input-group>
  </div>
</template>

<script>
export default {
  name: 'ChatRoom',
  data: function () {
    return {
      wsuri: "ws://127.0.0.1:3000",
      name: '',
      inputname: '',
      nameState: null,
      modalShow: true,
      sendmessage: '',
      msglist: [],
      height: document.documentElement.clientHeight
    }
  },
  created() {
    this.initWebSocket();
  },
  destroyed() {
    this.websock.close();
  },
  mounted(){
    var _this = this
    window.onresize = function () {
      _this.height = document.documentElement.clientHeight
    };
  },
  watch: {
  },
  methods: {
    initWebSocket(){
      console.log(this.wsuri);
      this.websock = new WebSocket(this.wsuri);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen(){
      console.log('WS已連線');
      this.msglist.push({user: 'system', msg: '聊天室已連接'});
    },
    websocketonerror(){
    },
    websocketonmessage(e){
      const redata = JSON.parse(e.data);
      switch (redata.user) {
        case 'other':
          this.msglist.push({user: redata.user, msg: `${redata.sender} : ${redata.msg}`});
          break;
        case 'system':
          this.msglist.push({user: redata.user, msg: redata.msg});
          break;
        default:
          break;
      }
      console.log(this.msglist);
      console.log(redata);
    },
    websocketsend(Data){
      this.websock.send(Data);
    },
    websocketclose(e){
      console.log(e);
    },
    sendmsg () {
      if (!this.sendmessage) return;
      this.websocketsend(JSON.stringify({type: '1', msg: this.sendmessage}));
      this.msglist.push({user: 'me', msg: this.sendmessage});
      this.sendmessage = ''
    },
    clearmsg () {
      this.msglist = []
    },
    checkFormValidity() {
        const valid = this.$refs.form.checkValidity()
        this.nameState = valid
        return valid
    },
    resetModal() {
      this.nameState = null
      this.inputname = this.name;
    },
    handleOk(bvModalEvt) {
      // Prevent modal from closing
      bvModalEvt.preventDefault()
      // Trigger submit handler
      this.handleSubmit()
    },
    handleSubmit() {
      // Exit when the form isn't valid
      if (!this.checkFormValidity()) {
        return
      }
      // Hide the modal manually
      this.$nextTick(() => {
        this.$bvModal.hide('modal-prevent-closing')
      })
      if (this.name) {
        this.websocketsend(JSON.stringify({type: '2', name: this.inputname}));
        } else {
        console.log('set')
        this.websocketsend(JSON.stringify({type: '0', name: this.inputname}));
      }
      this.name = this.inputname;
      this.nameState = null;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
#chartroom {
  background: radial-gradient(ellipse,white,#ffe0e3);
}
#messages {
  padding: 5% 10% 0px;
  border-radius: 10px;
  background-color: rgba(255,255,255,0.2);
  overflow: auto;
}
#messages > div {
  margin: 0 0 0.5em;
  border-radius: 1em;
  padding: 0.5em 1em;
  background-color: #ffeeba;
  max-width: 85%;
  clear: both;
  position: relative;
  word-wrap: break-word;
  display: block;
}
#messages div.me {
  float: right;
  background-color: #f5c6cb;
}
#messages div.other {
  float: left;
}
#messages div.system {
  margin: 0 auto;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.075);
}
</style>
