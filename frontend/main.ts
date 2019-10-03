import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

Vue.use(Vuetify);

interface Time {
  hour: number;
  minute: number;
}

const MINUTE_MS = 1000 * 60;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

const COLORS: { id: string; name: string; code: string }[] = [
  { id: '1', name: 'Lavender: Lecture', code: '#7986CB' },
  { id: '2', name: 'Sage: Housework', code: '#33B679' },
  { id: '3', name: 'Grape: Study (Languages)', code: '#8E24AA' },
  { id: '4', name: 'Flamingo', code: '#E67C73' },
  { id: '5', name: 'Banana', code: '#F6BF26' },
  { id: '6', name: 'Mikan: Sleep', code: '#F4511E' },
  { id: '7', name: 'Peacock: Study (Hobby)', code: '#039BE5' },
  { id: '8', name: 'Graphite: Study', code: '#616161' },
  { id: '9', name: 'Blueberry: Default', code: '#3F51B5' },
  { id: '10', name: 'Basil: Work', code: '#0B8043' },
  { id: '11', name: 'Tomato: Meal', code: '#D50000' }
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
  '11': '#D50000'
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
    studyHour: {
      hour: 0,
      minute: 0
    },
    idleHour: {
      hour: 0,
      minute: 0
    },
    state: {
      hasActivity: false,
      availableIdleHour: false
    },
    colors: COLORS,
    codes: COLOR_CODES
  },
  created: function() {
    this.loadAll();
  },
  filters: {
    zero_padding: function(v: number) {
      return ('0' + v).slice(-2);
    }
  },
  methods: {
    clearForm: function() {
      this.form.activity.title = '';
      this.form.activity.color = '9';
    },
    loadAll: function() {
      this.loadActivity();
      this.loadTasks();
      this.calcStudyHours();
      this.calcIdleTime();
    },
    async loadTasks() {
      const now = new Date().getTime();
      const tasks = await callFunction(
        'getTasksFromPlan',
        now,
        now + 1000 * 60 * 60 * 24
      );
      this.tasks = tasks;
    },
    async loadActivity() {
      const activity = await callFunction('getCurrentActivity');
      if (!activity) {
        this.state.hasActivity = false;
      } else {
        this.state.hasActivity = true;
        this.activity = activity;
        this.form.activity.title = this.activity.title;
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
      this.calcStudyHours();
    },
    async deleteActivity() {
      const res = await callFunction('deleteCurrentActivity');
      this.state.hasActivity = false;
    },
    async finishActivity() {
      const res = await callFunction('recordActivity', {
        title: this.form.activity.title,
        startTime: this.activity.startTime,
        endTime: new Date().getTime(),
        color: this.activity.color
      });
    },
    async calcStudyHours() {
      const now = new Date().getTime();
      const today = now - ((now + 6 * HOUR_MS) % DAY_MS);
      const acts: any[] = await callFunction(
        'getTasksFromActivity',
        today,
        today + DAY_MS
      );
      const study_ms = acts
        .filter(e => e.color == '8' || e.color == '3')
        .map(e => e.endTime - e.startTime)
        .reduce((acc, cur) => acc + cur, 0);
      const lecture_ms = acts.filter(e => e.color == '1').length * HOUR_MS;
      this.studyHour = msToTime(study_ms + lecture_ms);
    },
    async calcIdleTime() {
      const time = await callFunction('calcIdleTime');
      if (!time) {
        this.state.availableIdleHour = false;
        return false;
      }
      this.state.availableIdleHour = true;
      this.idleHour = msToTime(time);
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

function msToTime(ms: number): Time {
  const h = Math.floor(ms / HOUR_MS);
  return {
    hour: h,
    minute: Math.floor((ms - h * HOUR_MS) / MINUTE_MS)
  };
}
