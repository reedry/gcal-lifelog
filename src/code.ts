import { CALENDAR_ID } from './config'

const MINUTE_MS = 1000 * 60;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

interface Activity {
  title: string;
  startTime: number;
}

interface Task {
  title: string;
  startTime: number;
  endTime: number;
  color: string;
}

function doGet(e: any) {
  return HtmlService.createHtmlOutputFromFile('index.html')
    .setTitle('LifeLog')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function getTasks(
  cal: GoogleAppsScript.Calendar.Calendar,
  startTime: number,
  endTime: number
): Task[] {
  let events = cal.getEvents(new Date(startTime), new Date(endTime));
  return events
    .filter(function(e) {
      return !e.isAllDayEvent();
    })
    .map(parseTask);
}

function getTasksFromPlan(startTime: number, endTime: number) {
  return getTasks(CalendarApp.getDefaultCalendar(), startTime, endTime);
}

function getTasksFromActivity(startTime: number, endTime: number) {
  return getTasks(getActivityCalendar(), startTime, endTime);
}

function parseTask(event: GoogleAppsScript.Calendar.CalendarEvent): Task {
  let title = event.getTitle();
  if (!title) {
    title = '';
  }
  return {
    title: title,
    startTime: event.getStartTime().getTime(),
    endTime: event.getEndTime().getTime(),
    color: event.getColor()
  };
}

function getCurrentActivity(): Activity | undefined {
  const properties = PropertiesService.getScriptProperties();
  const currentActivity = properties.getProperty('CURRENT_ACTIVITY');
  if (currentActivity) {
    return JSON.parse(currentActivity);
  } else {
    return undefined;
  }
}

function registerCurrentActivity(activity: Activity): void {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('CURRENT_ACTIVITY', JSON.stringify(activity));
}

function recordActivity(activity: Task): void {
  const cal = getActivityCalendar();
  const event = cal.createEvent(
    activity.title,
    new Date(activity.startTime),
    new Date(activity.endTime)
  );
  if (activity.color != '') {
    event.setColor(activity.color);
  }
}

function getActivityCalendar(): GoogleAppsScript.Calendar.Calendar {
  return CalendarApp.getCalendarById(CALENDAR_ID.plan);
}

function deleteCurrentActivity(): void {
  const properties = PropertiesService.getScriptProperties();
  properties.deleteProperty('CURRENT_ACTIVITY');
}

function getWakeUpTime(): number | undefined {
  const properties = PropertiesService.getScriptProperties();
  const wakeup_time = properties.getProperty('WAKEUP_TIME');
  if (!wakeup_time) {
    const now = new Date().getTime();
    const activities = getTasksFromActivity(now - DAY_MS, now);
    for (const act of activities) {
      if (act.color == '6' && act.title == '睡眠') {
        properties.setProperty('WAKEUP_TIME', JSON.stringify(act.endTime));
        return act.endTime;
      }
    }
    properties.setProperty('WAKEUP_TIME', 'N/A');
    return undefined;
  } else if (wakeup_time == 'N/A') {
    return undefined;
  } else {
    return JSON.parse(wakeup_time);
  }
}

function calcIdleTime(): number | undefined {
  const wakeup_time = getWakeUpTime();
  if (!wakeup_time) {
    return undefined;
  }
  const now = new Date().getTime();
  const activities = getTasksFromActivity(wakeup_time, now);
  let res = 0;
  let current_time = wakeup_time;
  for (const act of activities) {
    res += act.startTime - current_time;
    current_time = act.endTime;
  }
  res += now - current_time;
  return res;
}

function testGetTasks(): void {
  const now = new Date().getTime();
  Logger.log(getTasksFromPlan(now, now + 1000 * 60 * 60 * 24));
}

function testGetActivity(): void {
  Logger.log(getCurrentActivity());
}

function testColorNames(): void {
  const cal = CalendarApp.getCalendarById(CALENDAR_ID.test);
  const events = cal.getEventsForDay(new Date('2019-08-20'));
  let res = [];
  for (let ev of events) {
    res.push({ color: ev.getColor(), title: ev.getTitle() });
  }
  res.sort(function(a, b) {
    return parseInt(a.color) - parseInt(b.color);
  });
  for (let it of res) {
    Logger.log('color:' + it.color + ', title:' + it.title);
  }
}
