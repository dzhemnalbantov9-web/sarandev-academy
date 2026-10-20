export type Salon = "haskovo" | "plovdiv";

export type CourseSchedule = {
  id: string;
  course_id: string;
  variant_index: number;
  salon: Salon;
  start_date: string;
  start_time: string;
  capacity: number;
  status: "open" | "cancelled";
  note: string;
  version: number;
};

export type UpcomingCourse = CourseSchedule & {
  remaining_seats: number;
};

export const cityNames: Record<Salon, string> = {
  haskovo: "Хасково",
  plovdiv: "Пловдив",
};

export function formatCourseDate(date: string) {
  return new Intl.DateTimeFormat("bg-BG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Sofia",
  }).format(new Date(`${date}T12:00:00+03:00`));
}