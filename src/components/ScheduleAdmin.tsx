"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { adminClient } from "../lib/academy-admin-client";
import { courseName } from "../lib/academy-types";
import type { Course } from "../lib/academy-types";
import {
  cityNames,
  formatCourseDate,
} from "../lib/academy-schedule";
import type {
  Salon,
  UpcomingCourse,
} from "../lib/academy-schedule";
import "./schedule-admin.css";

type Draft = {
  id?: string;
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

export default function ScheduleAdmin({
  courses,
}: {
  courses: Course[];
}) {
  const [rows, setRows] = useState<UpcomingCourse[]>([]);
  const [salon, setSalon] = useState<Salon>("haskovo");
  const [filter, setFilter] = useState("future");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dirty, setDirty] = useState(false);
  const lock = useRef(false);

  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Sofia",
  }).format(new Date());

  async function load() {
    const { data, error: dbError } = await adminClient().rpc(
      "academy_upcoming_courses",
      { p_admin: true }
    );

    if (dbError) {
      throw new Error(
        "Графикът не се зареди. Провери дали новият SQL е изпълнен."
      );
    }

    setRows((data ?? []) as UpcomingCourse[]);
  }

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        const { data, error: dbError } =
          await adminClient().rpc(
            "academy_upcoming_courses",
            { p_admin: true }
          );

        if (dbError) throw dbError;
        if (active) setRows((data ?? []) as UpcomingCourse[]);
      } catch {
        if (active) {
          setError(
            "Графикът не се зареди. Провери дали новият SQL е изпълнен."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void start();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", warn);

    return () => {
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty]);

  async function action(work: () => Promise<void>) {
    if (lock.current) return;

    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");

    try {
      await work();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Промяната не е запазена."
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function mayDiscard() {
    return (
      !dirty ||
      window.confirm(
        "Има незапазена дата. Да изхвърля ли редакциите?"
      )
    );
  }

  function newDate() {
    if (!mayDiscard()) return;

    if (!courses.length) {
      setError(
        "Първо добави и запази курс от раздел „Курсове“."
      );
      return;
    }

    setDraft({
      course_id: courses[0].id,
      variant_index: 0,
      salon,
      start_date: today,
      start_time: "10:00",
      capacity: 3,
      status: "open",
      note: "",
      version: 1,
    });

    setDirty(true);
    setError("");
    setNotice("");
  }

  function edit(row: UpcomingCourse) {
    if (!mayDiscard()) return;

    setDraft({
      ...row,
      start_time: row.start_time.slice(0, 5),
    });

    setDirty(false);
    setError("");
    setNotice("");
  }

  function field<K extends keyof Draft>(
    key: K,
    value: Draft[K]
  ) {
    if (!draft) return;

    setDraft({ ...draft, [key]: value });
    setDirty(true);
    setNotice("");
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;

    const value = { ...draft };

    await action(async () => {
      const course = courses.find(
        (c) => c.id === value.course_id
      );

      if (!course?.variants[value.variant_index]) {
        throw new Error(
          "Избери валиден курс и ценови вариант. Първо запази промените по самия курс."
        );
      }

      if (
        !value.start_date ||
        !value.start_time ||
        !Number.isInteger(value.capacity) ||
        value.capacity < 1 ||
        value.capacity > 500
      ) {
        throw new Error(
          "Попълни дата, час и капацитет от 1 до 500 места."
        );
      }

      const payload = {
        course_id: value.course_id,
        variant_index: value.variant_index,
        salon: value.salon,
        start_date: value.start_date,
        start_time: value.start_time,
        capacity: value.capacity,
        status: value.status,
        note: value.note.trim(),
        version: value.id ? value.version + 1 : 1,
      };

      const db = adminClient();

      const request = value.id
        ? db
            .from("academy_course_schedule")
            .update(payload)
            .eq("id", value.id)
            .eq("version", value.version)
        : db
            .from("academy_course_schedule")
            .insert(payload);

      const { data, error: dbError } =
        await request.select("id").single();

      if (dbError || !data) {
        if (dbError?.code === "P0001") {
          throw new Error(dbError.message);
        }

        if (dbError?.code === "23505") {
          throw new Error(
            "Вече има същия курс в този град, на тази дата и час."
          );
        }

        throw new Error(
          "Датата не е записана. Възможна е по-нова редакция. Копирай промените и натисни „Обнови графика“."
        );
      }

      setDraft(null);
      setDirty(false);
      setNotice(
        "Датата е запазена. Отворените бъдещи обучения се показват на сайта."
      );

      await load();
    });
  }

  async function cancel(row: UpcomingCourse) {
    if (!mayDiscard()) return;

    const question =
      row.status === "cancelled"
        ? `Да отворя ли отново обучението за ${formatCourseDate(row.start_date)} в ${cityNames[row.salon]}?`
        : `Да отменя ли обучението за ${formatCourseDate(row.start_date)} в ${cityNames[row.salon]}? Свържи се отделно със записаните клиенти.`;

    if (!window.confirm(question)) return;

    await action(async () => {
      const { data, error: dbError } = await adminClient()
        .from("academy_course_schedule")
        .update({
          status:
            row.status === "cancelled" ? "open" : "cancelled",
          version: row.version + 1,
        })
        .eq("id", row.id)
        .eq("version", row.version)
        .select("id")
        .single();

      if (dbError || !data) {
        throw new Error(
          dbError?.code === "P0001"
            ? dbError.message
            : "Статусът не е променен. Обнови графика."
        );
      }

      setDraft(null);
      setDirty(false);
      await load();

      setNotice(
        row.status === "cancelled"
          ? "Обучението е отворено отново."
          : "Обучението е отменено и е скрито от публичния график. Записванията са запазени."
      );
    });
  }

  async function remove(row: UpcomingCourse) {
    if (!mayDiscard()) return;

    if (
      !window.confirm(
        "Да премахна ли тази дата? Съществуващите заявки ще останат в „Записвания“."
      )
    ) {
      return;
    }

    await action(async () => {
      const { data, error: dbError } = await adminClient()
        .from("academy_course_schedule")
        .delete()
        .eq("id", row.id)
        .eq("version", row.version)
        .select("id")
        .single();

      if (dbError || !data) {
        throw new Error(
          "Датата не беше премахната. Обнови графика."
        );
      }

      setDraft(null);
      setDirty(false);
      await load();
      setNotice(
        "Датата е премахната. Записванията са запазени."
      );
    });
  }

  const selectedCourse = courses.find(
    (c) => c.id === draft?.course_id
  );

  const visible = rows
    .filter(
      (row) =>
        row.salon === salon &&
        (
          filter === "all" ||
          (
            row.start_date >= today &&
            row.status === "open"
          )
        )
    )
    .sort((a, b) =>
      `${a.start_date} ${a.start_time}`.localeCompare(
        `${b.start_date} ${b.start_time}`
      )
    );

  return (
    <section className="scheduleAdmin">
      <p>
        Датите се записват отделно с бутона „Запази датата“.
        Преди това запази редакциите по курсовете от основния
        панел.
      </p>

      <div className="scheduleControls">
        <div className="rowActions">
          {(["haskovo", "plovdiv"] as Salon[]).map((city) => (
            <button
              type="button"
              key={city}
              aria-pressed={salon === city}
              onClick={() => setSalon(city)}
            >
              Предстоящи курсове — {cityNames[city]}
            </button>
          ))}
        </div>

        <div className="rowActions">
          <button
            type="button"
            disabled={busy}
            onClick={newDate}
          >
            + Добави дата
          </button>

          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!mayDiscard()) return;

              void action(async () => {
                setDraft(null);
                setDirty(false);
                await load();
                setNotice("Графикът е обновен.");
              });
            }}
          >
            Обнови графика
          </button>

          <select
            aria-label="Период на графика"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="future">
              Предстоящи и отворени
            </option>
            <option value="all">
              Всички, включително отменени и минали
            </option>
          </select>
        </div>
      </div>

      {error && (
        <p className="adminMessage error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="adminMessage success" role="status">
          {notice}
        </p>
      )}

      {draft && (
        <form className="scheduleForm" onSubmit={save}>
          <h2>
            {draft.id
              ? "Редактиране на дата"
              : "Нова дата за обучение"}
          </h2>

          <fieldset disabled={busy}>
            <div className="editorFields">
              <label>
                <span>Курс *</span>
                <select
                  required
                  value={draft.course_id}
                  onChange={(e) => {
                    setDraft({
                      ...draft,
                      course_id: e.target.value,
                      variant_index: 0,
                    });
                    setDirty(true);
                  }}
                >
                  {!selectedCourse && (
                    <option value={draft.course_id}>
                      Курсът е премахнат — избери друг
                    </option>
                  )}

                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {courseName(c)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Вариант / продължителност *</span>
                <select
                  required
                  value={draft.variant_index}
                  onChange={(e) =>
                    field(
                      "variant_index",
                      Number(e.target.value)
                    )
                  }
                >
                  {selectedCourse?.variants.map((v, i) => (
                    <option key={i} value={i}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Град *</span>
                <select
                  value={draft.salon}
                  onChange={(e) =>
                    field("salon", e.target.value as Salon)
                  }
                >
                  <option value="haskovo">Хасково</option>
                  <option value="plovdiv">Пловдив</option>
                </select>
              </label>

              <label>
                <span>Статус</span>
                <select
                  value={draft.status}
                  onChange={(e) =>
                    field(
                      "status",
                      e.target.value as Draft["status"]
                    )
                  }
                >
                  <option value="open">
                    Отворено за записване
                  </option>
                  <option value="cancelled">
                    Отменено / скрито
                  </option>
                </select>
              </label>

              <label>
                <span>Начална дата *</span>
                <input
                  required
                  type="date"
                  value={draft.start_date}
                  onChange={(e) =>
                    field("start_date", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Начален час *</span>
                <input
                  required
                  type="time"
                  step={60}
                  value={draft.start_time}
                  onChange={(e) =>
                    field("start_time", e.target.value)
                  }
                />
              </label>

              <label>
                <span>Общ брой места *</span>
                <input
                  required
                  type="number"
                  min={1}
                  max={500}
                  step={1}
                  value={draft.capacity}
                  onChange={(e) =>
                    field("capacity", Number(e.target.value))
                  }
                />
              </label>

              <label className="wide">
                <span>Бележка за сайта — по желание</span>
                <textarea
                  maxLength={1500}
                  rows={3}
                  value={draft.note}
                  onChange={(e) =>
                    field("note", e.target.value)
                  }
                  placeholder="Например: малка група, осигурени материали…"
                />
              </label>
            </div>

            <p>
              Цената и отстъпката от 5% се вземат от избрания
              курс. Местата се заемат при потвърждаване на
              заявка в „Записвания“.
            </p>

            <div className="rowActions">
              <button className="primary" type="submit">
                {busy ? "Запазване…" : "Запази датата"}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (mayDiscard()) {
                    setDraft(null);
                    setDirty(false);
                  }
                }}
              >
                Затвори редакцията
              </button>
            </div>
          </fieldset>
        </form>
      )}

      {loading && (
        <p role="status">Зареждане на графика…</p>
      )}

      {!loading && (
        <p>
          Показани {visible.length} обучения. Зареждат се
          до 1000 дати; за стари дати избери „Всички“.
        </p>
      )}

      <div className="recordGrid">
        {visible.map((row) => {
          const course = courses.find(
            (c) => c.id === row.course_id
          );

          return (
            <article className="recordCard" key={row.id}>
              <div className="recordTop">
                <h2>
                  {course
                    ? courseName(course)
                    : "Премахнат курс"}
                </h2>
                <span>{cityNames[row.salon]}</span>
              </div>

              <p>
                {formatCourseDate(row.start_date)}
                {" · "}
                {row.start_time.slice(0, 5)} ч.
              </p>

              <p>
                {course?.variants[row.variant_index]?.label ??
                  "Вариантът е премахнат — редактирай датата"}
              </p>

              <p>
                {row.status === "cancelled"
                  ? "Отменено / скрито"
                  : "Отворено"}
                {" · "}Свободни места:{" "}
                <strong>{row.remaining_seats}</strong>
                {" "}от {row.capacity}
              </p>

              {row.note && (
                <p className="prewrap">{row.note}</p>
              )}

              <div className="rowActions">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => edit(row)}
                >
                  Редактирай
                </button>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cancel(row)}
                >
                  {row.status === "cancelled"
                    ? "Отвори отново"
                    : "Отмени"}
                </button>

                <button
                  type="button"
                  className="danger"
                  disabled={busy}
                  onClick={() => void remove(row)}
                >
                  Премахни
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}