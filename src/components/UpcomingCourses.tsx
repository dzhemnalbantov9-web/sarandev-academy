"use client";

import { useEffect, useState } from "react";
import type { Course } from "../lib/academy-types";
import {
  courseName,
  discounted,
  euro,
} from "../lib/academy-types";
import { publicClient } from "../lib/academy-public-client";
import {
  cityNames,
  formatCourseDate,
} from "../lib/academy-schedule";
import type {
  Salon,
  UpcomingCourse,
} from "../lib/academy-schedule";
import "./upcoming-courses.css";

export default function UpcomingCourses({
  courses,
  onSelect,
}: {
  courses: Course[];
  onSelect: (row: UpcomingCourse) => void;
}) {
  const [rows, setRows] = useState<UpcomingCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let running = false;

    async function load() {
      if (running) return;
      running = true;

      try {
        const { data, error: dbError } =
          await publicClient().rpc("academy_upcoming_courses");

        if (dbError) throw dbError;

        if (active) {
          setRows((data ?? []) as UpcomingCourse[]);
          setError("");
        }
      } catch {
        if (active) {
          setError(
            "Графикът временно не може да се зареди. Опитай отново или се свържи с нас."
          );
        }
      } finally {
        running = false;
        if (active) setLoading(false);
      }
    }

    void load();

    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };

    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60000);

    return () => {
      active = false;
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, [retry]);

  return (
    <section id="upcoming" className="section upcomingSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">ИЗБЕРИ СВОЯТА ДАТА</p>
          <h2>
            Предстоящи курсове.<br />
            <em>Твоето ново начало.</em>
          </h2>
        </div>

        <p className="sectionIntro">
          Обучения в Хасково и Пловдив. Избери дата и изпрати
          заявка. Мястото е запазено след потвърждение от
          академията.
        </p>
      </div>

      {loading && (
        <p role="status">Зареждане на предстоящите обучения…</p>
      )}

      {error && (
        <div className="upcomingError" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setRetry((x) => x + 1);
            }}
          >
            Опитай отново
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="upcomingCities">
          {(["haskovo", "plovdiv"] as Salon[]).map((salon) => {
            const cityRows = rows.filter(
              (row) =>
                row.salon === salon &&
                courses.some(
                  (c) =>
                    c.id === row.course_id &&
                    c.variants[row.variant_index]
                )
            );

            return (
              <div className="upcomingCity" key={salon}>
                <div className="upcomingCityHeading">
                  <p className="eyebrow">ПРЕДСТОЯЩИ КУРСОВЕ</p>
                  <h3>
                    {cityNames[salon]}<span>.</span>
                  </h3>
                </div>

                {cityRows.length === 0 && (
                  <p className="upcomingEmpty">
                    Очаквайте нови дати за {cityNames[salon]}.
                    Можеш да изпратиш и запитване за удобна дата.
                  </p>
                )}

                {cityRows.map((row) => {
                  const course = courses.find(
                    (c) => c.id === row.course_id
                  )!;

                  const variant =
                    course.variants[row.variant_index];

                  return (
                    <article
                      className="upcomingCard"
                      key={row.id}
                    >
                      <div className="upcomingDate">
                        <span>
                          {formatCourseDate(row.start_date)}
                        </span>
                        <strong>
                          {row.start_time.slice(0, 5)} ч.
                        </strong>
                      </div>

                      <h4>{courseName(course)}</h4>

                      <p className="upcomingVariant">
                        {variant.label}
                      </p>

                      {row.note && (
                        <p className="upcomingNote">
                          {row.note}
                        </p>
                      )}

                      <p className="upcomingSeats">
                        {row.remaining_seats > 0
                          ? `Свободни места: ${row.remaining_seats}`
                          : "Местата са запълнени"}
                      </p>

                      <div className="upcomingBottom">
                        <div>
                          <small>
                            Цена: {euro(variant.price)}
                          </small>
                          <strong>
                            {euro(discounted(variant.price))}
                          </strong>
                          <small>
                            при записване през сайта (−5%)
                          </small>
                        </div>

                        <button
                          className="button darkButton"
                          type="button"
                          disabled={row.remaining_seats <= 0}
                          onClick={() => onSelect(row)}
                        >
                          {row.remaining_seats > 0
                            ? "Запиши се ↗"
                            : "Няма места"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}