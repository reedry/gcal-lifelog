import Vue from 'vue';

const app = new Vue({
  el: '#app',
  data: {
    activity: {
      title: '',
      startTime: 0
    },
    form: {
      activity: {
        title: ''
      }
    },
    tasks: [{ title: 'prev1' }, { title: 'prev2' }],
    state: {
      hasActivity: false
    }
  },
  created: function() {
    this.loadAll();
  },
  methods: {
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
        startTime: new Date().getTime()
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
        endTime: new Date().getTime()
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
