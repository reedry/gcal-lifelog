import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

const COLORS: {id: string, name: string, code: string }[] = [
  { id: '1', name:'Lavender', code: '#7986CB' },
  { id: '2', name:'Sage', code: '#33B679' },
  { id: '3', name:'Grape', code: '#8E24AA' },
  { id: '4', name:'Flamingo', code: '#E67C73' },
  { id: '5', name:'Banana', code: '#F6BF26' },
  { id: '6', name:'Mikan', code: '#F4511E' },
  { id: '7', name:'Peacock: Study (Hobby)', code: '#039BE5' },
  { id: '8', name:'Graphite: Study', code: '#616161' },
  { id: '9', name:'Blueberry: Default', code: '#3F51B5' },
  { id: '10', name:'Basil', code: '#0B8043'},
  { id: '11', name:'Tomato', code: '#D50000'},
];

const COLOR_CODES = {
  '1': '#7986CB',
  '2': '#33B679',
  '3': '#8E24AA',
  '4': '#E67C73',
  '5': '#F6BF26',
  '6': '#F4511E',
  '7': '#039BE5',
  '8': '#616161',
  '9': '#3F51B5',
  '10': '#0B8043',
  '11': '#D50000',
};

const app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data: {
    activity: {
      title: '',
      startTime: 0,
      color: '9'
    },
    form: {
      activity: {
        title: '',
        color: '9'
      }
    },
    tasks: [{ title: 'prev1' }, { title: 'prev2' }],
    state: {
      hasActivity: false
    },
    colors: COLORS,
    codes: COLOR_CODES
  },
  created: function() {
    this.loadAll();
  },
  methods: {
    clearForm: function() {
      this.form.activity.title = '';
      this.form.activity.color = '9';
    },
    loadAll: function() {
      this.loadTasks();
      this.loadActivity();
    },
    async loadTasks() {
      const tasks = await callFunction('fetchTasks');
      this.tasks = tasks;
    },
    async loadActivity() {
      const activity = await callFunction('getCurrentActivity');
      if (!activity) {
        this.state.hasActivity = false;
      } else {
        this.state.hasActivity = true;
        this.activity = activity;
      }
    },
    async startActivity() {
      const res = await callFunction('registerCurrentActivity', {
        title: this.form.activity.title,
        startTime: new Date().getTime(),
        color: this.form.activity.color
      });
      this.loadAll();
    },
    stopActivity: function() {
      this.finishActivity();
      this.deleteActivity();
    },
    async deleteActivity() {
      const res = await callFunction('deleteCurrentActivity');
      this.state.hasActivity = false;
    },
    async finishActivity() {
      const res = await callFunction('recordActivity', {
        title: this.activity.title,
        startTime: this.activity.startTime,
        endTime: new Date().getTime(),
        color: this.activity.color
      });
    }
  }
});

function callFunction(name: string, ...args: any): Promise<any> {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler(resolve)
      .withFailureHandler(reject)
      [name](...args);
  });
}
