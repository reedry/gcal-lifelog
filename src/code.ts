import { CALENDAR_ID } from './config'

const targetCalendar: string = 'Activity';
interface Activity {
  title: string;
  startTime: number;
}

function getNextTasks(): GoogleAppsScript.Calendar.CalendarEvent[] | null {
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
    return null;
  }
}

function getCurrentActivity(): Activity | null {
  const properties = PropertiesService.getScriptProperties();
  const currentActivity = properties.getProperties();
  if (currentActivity) {
    return JSON.parse(currentActivity);
  } else {
    return null;
  }
}

function registerCurrentActivity(activity: Activity): void {
  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('CURRENT_ACTIVITY', JSON.stringify(activity));
}

function testCalApi(): void {
  let nextTasks = getNextTasks();
  if (nextTasks == null) {
    Logger.log("Not Found");
  } else {
    Logger.log(nextTasks[0].getTitle());
  }
}
