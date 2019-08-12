import { CALENDAR_ID } from './config'

interface Activity {
  title: string;
  startTime: number;
}

function doGet(e: any) {
  return HtmlService.createHtmlOutputFromFile('index.html')
    .setTitle("LifeLog");
}

function getNextTasks(): GoogleAppsScript.Calendar.CalendarEvent[] | undefined {
  let cal = CalendarApp.getDefaultCalendar();
  let now = new Date();
  let oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let events = cal.getEvents(now, oneDayFromNow);
  let res: any[] = [];
  for (let ev of events) {
    if(!ev.isAllDayEvent()) {
      res.push(ev);
    }
  }
  if (res.length > 0) {
    return res;
  } else {
    return undefined;
  }
}

function getCurrentActivity(): Activity | undefined {
  const properties = PropertiesService.getScriptProperties();
  const currentActivity = properties.getProperties();
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

function testCalApi(): void {
  let nextTasks = getNextTasks();
  if (nextTasks == undefined) {
    Logger.log("Not Found");
  } else {
    Logger.log(nextTasks[0].getTitle());
  }
}
