import { CALENDAR_ID } from './config'

const targetCalendar: string = 'Activity';

function getNextTask(): GoogleAppsScript.Calendar.CalendarEvent | null {
  let cal = CalendarApp.getDefaultCalendar();
  let now = new Date();
  let oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  let events = cal.getEvents(now, oneDayFromNow);
  if (events == []) {
    return null;
  }
  for (let ev of events) {
    if(!ev.isAllDayEvent()) {
      return ev;
    }
  }
  return null;
}

function testCalApi(): void {
  let nextTask = getNextTask();
  if (nextTask == null) {
    Logger.log("Not Found");
  } else {
    Logger.log(nextTask.getTitle());
  }
}
