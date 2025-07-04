export interface Time {
  startTime: string
  endTime: string
}
export type WeekDays = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export interface WorkTime {
  daysOfWeek: WeekDays[]
  times: Time[]
}
export class WorkTimeDto implements WorkTime {
  daysOfWeek: WeekDays[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Saturday',
    'Sunday',
  ];

  times = [{ startTime: '07:00', endTime: '22:00' }]
}
