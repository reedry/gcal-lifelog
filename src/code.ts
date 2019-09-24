import { CALENDAR_ID } from './config'

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
