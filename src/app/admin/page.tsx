"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { adminClient } from "../../lib/academy-admin-client";
import { euro, validContent } from "../../lib/academy-types";
import type {
  Content,
  Course,
  Service,
  TeamMember,
} from "../../lib/academy-types";
import ScheduleAdmin from "../../components/ScheduleAdmin";
import "./admin.css";

type Booking = {
  id: string;
  customer_name: string;
  phone: string;
  email: string | null;
  salon: string;
  booking_type: string;
  offering: string;
  preferred_date: string;
  preferred_time: string;
  note: string | null;
  admin_status: string;
  created_at: string;
  scheduled_course_id?: string | null;
  original_price: number | null;
  discount_percent: number | null;
  final_price: number | null;
};

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
  approved: boolean;
  created_at: string;
};

type Tab =
  | "bookings"
  | "schedule"
  | "courses"
  | "services"
  | "team"
  | "reviews";

const tabLabels: Record<Tab, string> = {
  bookings: "Записвания",
  schedule: "Предстоящи курсове",
  courses: "Курсове",
  services: "Услуги",
  team: "Екип",
  reviews: "Отзиви",
};

const statuses: Record<string, string> = {
  new: "Нова",
  confirmed: "Потвърдена",
  completed: "Приключена",
  cancelled: "Отказана",
};

const freshCourse = (): Course => ({
  id: `course-${crypto.randomUUID()}`,
  label: "ОБУЧЕНИЕ",
  title: "Нов курс",
  subtitle: "",
  description: "",
  image: "/images/course-manicure.png",
  imageAlt: "Професионално обучение",
  meta: "Хасково и Пловдив",
  tags: [],
  variants: [{ label: "Обучение", price: 0 }],
  program: "",
  instructor: "София Сарандева",
});

const freshService = (): Service => ({
  id: `service-${crypto.randomUUID()}`,
  title: "Нова услуга",
  description: "",
  image: "/images/cosmetics.png",
  alt: "Услуга",
  items: ["Нова процедура"],
  itemPrices: {},
  specialistRole: "",
});

const freshMember = (): TeamMember => ({
  name: "Нов специалист",
  role: "",
  city: "Пловдив",
  phone: "",
  tel: "",
  image: "",
  description: "",
});

const clone = <T,>(value: T): T =>
  JSON.parse(JSON.stringify(value)) as T;

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className={multiline ? "wide" : ""}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={7}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </label>
  );
}

export default function Admin() {
  const [access, setAccess] = useState<
    "loading" | "login" | "ready"
  >("loading");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);

  const [tab, setTab] = useState<Tab>("bookings");
  const [content, setContent] = useState<Content | null>(null);
  const [version, setVersion] = useState(0);
  const [dirty, setDirty] = useState(false);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [date, setDate] = useState("");
  const [city, setCity] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [selected, setSelected] = useState(-1);

  async function loadAll() {
    const db = adminClient();

    const [c, b, r] = await Promise.all([
      db
        .from("academy_content")
        .select("data,version")
        .eq("id", 1)
        .single(),

      db
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),

      db
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);

    if (c.error || b.error || r.error) {
      throw new Error(
        "Данните не се заредиха. Провери SQL настройката и админ достъпа."
      );
    }

    if (!validContent(c.data?.data)) {
      throw new Error(
        "Съдържанието липсва или е невалидно. Изпълни SQL за началните данни."
      );
    }

    setContent(c.data.data);
    setVersion(c.data.version);
    setDirty(false);
    setBookings((b.data ?? []) as Booking[]);
    setReviews((r.data ?? []) as Review[]);
  }

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        const db = adminClient();
        const { data, error: authError } =
          await db.auth.getUser();

        if (!active) return;

        if (authError || !data.user) {
          setAccess("login");
          return;
        }

        const { data: allowed, error: roleError } =
          await db.rpc("academy_is_admin");

        if (roleError || !allowed) {
          await db.auth.signOut();
          setAccess("login");
          setError(
            "Този профил няма администраторски достъп."
          );
          return;
        }

        await loadAll();

        if (active) setAccess("ready");
      } catch (e) {
        if (active) {
          setError(
            e instanceof Error
              ? e.message
              : "Грешка при зареждане."
          );
          setAccess("login");
        }
      }
    }

    void start();

    let unsubscribe: (() => void) | undefined;

    try {
      const {
        data: { subscription },
      } = adminClient().auth.onAuthStateChange((event) => {
        if (active && event === "SIGNED_OUT") {
          setAccess("login");
          setContent(null);
          setBookings([]);
          setReviews([]);
        }
      });

      unsubscribe = () => subscription.unsubscribe();
    } catch {
      // Грешката при конфигурацията се показва от start().
    }

    return () => {
      active = false;
      unsubscribe?.();
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
          : "Операцията не беше изпълнена."
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  function edit(next: Content) {
    setContent(next);
    setDirty(true);
    setNotice("");
  }

  function changeTab(next: Tab) {
    setTab(next);
    setSelected(-1);
    setNotice("");
    setError("");
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const f = new FormData(event.currentTarget);

    await action(async () => {
      const db = adminClient();

      const { error: authError } =
        await db.auth.signInWithPassword({
          email: String(f.get("email")).trim(),
          password: String(f.get("password")),
        });

      if (authError) {
        throw new Error("Невалиден имейл или парола.");
      }

      const { data: allowed, error: roleError } =
        await db.rpc("academy_is_admin");

      if (roleError || !allowed) {
        await db.auth.signOut();
        throw new Error(
          "Този профил няма администраторски достъп."
        );
      }

      await loadAll();
      setAccess("ready");
    });
  }

  async function save() {
    await action(async () => {
      if (!content || !validContent(content)) {
        throw new Error(
          "Провери полетата. Всеки курс трябва да има поне един ценови вариант."
        );
      }

      if (
        content.courses.some(
          (c) =>
            !c.title.trim() ||
            !c.program.trim() ||
            c.variants.some(
              (v) =>
                !v.label.trim() ||
                v.price < 0 ||
                !Number.isFinite(v.price)
            )
        )
      ) {
        throw new Error(
          "Попълни заглавие, програма и валидни цени за всеки курс."
        );
      }

      if (
        content.services.some(
          (s) =>
            !s.title.trim() ||
            s.items.length === 0 ||
            s.items.some((item) => !item.trim()) ||
            new Set(s.items).size !== s.items.length ||
            Object.values(s.itemPrices).some(
              (p) =>
                p !== null &&
                (!Number.isFinite(p) || p < 0)
            )
        )
      ) {
        throw new Error(
          "Провери заглавията, процедурите и цените на услугите."
        );
      }

      if (
        content.team.some(
          (m) =>
            !m.name.trim() ||
            !m.role.trim() ||
            !m.phone.trim() ||
            !m.image.trim()
        )
      ) {
        throw new Error(
          "Попълни име, роля, телефон и снимка за всеки член на екипа."
        );
      }

      const { data, error: dbError } = await adminClient()
        .from("academy_content")
        .update({
          data: content,
          version: version + 1,
        })
        .eq("id", 1)
        .eq("version", version)
        .select("version")
        .single();

      if (dbError || !data) {
        throw new Error(
          "Промените не са записани. Възможна е по-нова версия от друг прозорец. Копирай редакциите си и натисни „Обнови“."
        );
      }

      setVersion(data.version);
      setDirty(false);
      setNotice("Промените са запазени.");
    });
  }

  async function bookingStatus(
    row: Booking,
    next: string
  ) {
    await action(async () => {
      const { data, error: dbError } = await adminClient()
        .from("bookings")
        .update({ admin_status: next })
        .eq("id", row.id)
        .select("id")
        .single();

      if (dbError || !data) {
        throw new Error(
          dbError?.code === "P0001"
            ? dbError.message
            : "Статусът не беше променен."
        );
      }

      setBookings((b) =>
        b.map((x) =>
          x.id === row.id
            ? { ...x, admin_status: next }
            : x
        )
      );

      setNotice("Статусът е запазен.");
    });
  }

  async function reviewUpdate(
    row: Review,
    remove = false
  ) {
    if (
      remove &&
      !window.confirm(
        "Да изтрия ли този отзив окончателно?"
      )
    ) {
      return;
    }

    await action(async () => {
      const db = adminClient();

      const request = remove
        ? db.from("reviews").delete().eq("id", row.id)
        : db
            .from("reviews")
            .update({ approved: !row.approved })
            .eq("id", row.id);

      const { data, error: dbError } =
        await request.select("id").single();

      if (dbError || !data) {
        throw new Error("Отзивът не беше променен.");
      }

      setReviews((r) =>
        remove
          ? r.filter((x) => x.id !== row.id)
          : r.map((x) =>
              x.id === row.id
                ? { ...x, approved: !x.approved }
                : x
            )
      );

      setNotice(
        remove
          ? "Отзивът е изтрит."
          : row.approved
            ? "Отзивът е скрит."
            : "Отзивът е публикуван."
      );
    });
  }

  function add() {
    if (!content) return;

    const next = clone(content);

    if (tab === "courses") {
      next.courses.push(freshCourse());
      setSelected(next.courses.length - 1);
    }

    if (tab === "services") {
      next.services.push(freshService());
      setSelected(next.services.length - 1);
    }

    if (tab === "team") {
      next.team.push(freshMember());
      setSelected(next.team.length - 1);
    }

    edit(next);
  }

  function remove() {
    if (
      !content ||
      selected < 0 ||
      !window.confirm(
        "Да премахна ли избрания запис? Промяната влиза в сила след „Запази промените“."
      )
    ) {
      return;
    }

    const next = clone(content);

    if (tab === "courses") next.courses.splice(selected, 1);
    if (tab === "services") next.services.splice(selected, 1);
    if (tab === "team") next.team.splice(selected, 1);

    edit(next);
    setSelected(-1);
  }

  function move(delta: number) {
    if (!content || selected < 0) return;

    const next = clone(content);

    const list =
      tab === "courses"
        ? next.courses
        : tab === "services"
          ? next.services
          : next.team;

    const to = selected + delta;

    if (to < 0 || to >= list.length) return;

    [list[selected], list[to]] = [
      list[to],
      list[selected],
    ];

    edit(next);
    setSelected(to);
  }

  const course = content?.courses[selected];
  const service = content?.services[selected];
  const member = content?.team[selected];

  function courseField<K extends keyof Course>(
    key: K,
    value: Course[K]
  ) {
    if (!content) return;

    const next = clone(content);
    next.courses[selected][key] = value;
    edit(next);
  }

  function serviceField<K extends keyof Service>(
    key: K,
    value: Service[K]
  ) {
    if (!content) return;

    const next = clone(content);
    next.services[selected][key] = value;
    edit(next);
  }

  function memberField<K extends keyof TeamMember>(
    key: K,
    value: TeamMember[K]
  ) {
    if (!content) return;

    const next = clone(content);
    next.team[selected][key] = value;

    if (key === "phone") {
      next.team[selected].tel = String(value).replace(
        /[^+\d]/g,
        ""
      );
    }

    edit(next);
  }

  const filtered = bookings.filter(
    (b) =>
      (
        status === "all" ||
        (b.admin_status || "new") === status
      ) &&
      (!date || b.preferred_date === date) &&
      (city === "all" || b.salon === city) &&
      [b.customer_name, b.phone, b.email, b.offering]
        .join(" ")
        .toLocaleLowerCase("bg")
        .includes(query.toLocaleLowerCase("bg"))
  );

  return (
    <main className="adminShell">
      <header className="adminHeader">
        <a href="/">
          SARANDEV <span>ACADEMY</span>
        </a>

        <span>Управление на сайта</span>

        {access === "ready" && (
          <button
            disabled={busy}
            onClick={() => {
              if (
                dirty &&
                !window.confirm(
                  "Има незапазени промени. Да изляза ли?"
                )
              ) {
                return;
              }

              void action(async () => {
                const { error: e } =
                  await adminClient().auth.signOut();

                if (e) throw e;

                setAccess("login");
                setDirty(false);
              });
            }}
          >
            Изход
          </button>
        )}
      </header>

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

      {access === "loading" ? (
        <p role="status">Проверка на достъпа…</p>
      ) : access === "login" ? (
        <form className="loginBox" onSubmit={login}>
          <p className="kicker">АДМИНИСТРАТОР</p>
          <h1>Добре дошла.</h1>

          <label>
            Имейл
            <input
              name="email"
              type="email"
              autoComplete="username"
              required
            />
          </label>

          <label>
            Парола
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button className="primary" disabled={busy}>
            {busy ? "Влизане…" : "Влез в панела ↗"}
          </button>

          <a href="/">Към сайта</a>
        </form>
      ) : (
        <>
          <div className="adminStats">
            <article>
              <strong>{bookings.length}</strong>
              <span>Заредени заявки</span>
            </article>

            <article>
              <strong>
                {
                  bookings.filter(
                    (x) =>
                      (x.admin_status || "new") === "new"
                  ).length
                }
              </strong>
              <span>Нови заявки</span>
            </article>

            <article>
              <strong>
                {content?.courses.length ?? 0}
              </strong>
              <span>Курсове</span>
            </article>

            <article>
              <strong>
                {reviews.filter((x) => !x.approved).length}
              </strong>
              <span>Чакащи отзиви</span>
            </article>
          </div>

          <nav className="adminTabs">
            {(Object.keys(tabLabels) as Tab[]).map((t) => (
              <button
                key={t}
                aria-pressed={tab === t}
                onClick={() => changeTab(t)}
              >
                {tabLabels[t]}
              </button>
            ))}
          </nav>

          <div className="adminToolbar">
            <h1>{tabLabels[tab]}</h1>

            <div>
              <button
                disabled={busy}
                onClick={() => {
                  if (
                    dirty &&
                    !window.confirm(
                      "Да изхвърля ли незапазените промени и да заредя последните данни?"
                    )
                  ) {
                    return;
                  }

                  void action(async () => {
                    await loadAll();
                    setSelected(-1);
                    setNotice("Данните са обновени.");
                  });
                }}
              >
                Обнови
              </button>

              {["courses", "services", "team"].includes(tab) && (
                <>
                  <button disabled={busy} onClick={add}>
                    + Добави
                  </button>

                  <button
                    className="primary"
                    disabled={busy || !dirty}
                    onClick={() => void save()}
                  >
                    {busy
                      ? "Запазване…"
                      : "Запази промените"}
                  </button>
                </>
              )}
            </div>
          </div>

          {dirty && (
            <p className="draftNotice">
              Има незапазени промени. Натисни
              „Запази промените“, за да ги публикуваш.
            </p>
          )}

          {content && (
            <div hidden={tab !== "schedule"}>
              <ScheduleAdmin courses={content.courses} />
            </div>
          )}

          {tab === "bookings" && (
            <>
              <div className="adminFilters">
                <input
                  aria-label="Търсене"
                  placeholder="Име, телефон, курс…"
                  value={query}
                  onChange={(e) =>
                    setQuery(e.target.value)
                  }
                />

                <select
                  aria-label="Статус"
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                >
                  <option value="all">
                    Всички статуси
                  </option>
                  {Object.entries(statuses).map(([v, l]) => (
                    <option value={v} key={v}>
                      {l}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Град"
                  value={city}
                  onChange={(e) =>
                    setCity(e.target.value)
                  }
                >
                  <option value="all">
                    Всички градове
                  </option>
                  <option value="haskovo">Хасково</option>
                  <option value="plovdiv">Пловдив</option>
                </select>

                <input
                  aria-label="Дата"
                  type="date"
                  value={date}
                  onChange={(e) =>
                    setDate(e.target.value)
                  }
                />

                <button
                  onClick={() => {
                    setQuery("");
                    setStatus("all");
                    setDate("");
                    setCity("all");
                  }}
                >
                  Изчисти
                </button>
              </div>

              <p>
                Показани {filtered.length} от{" "}
                {bookings.length} заредени заявки.
                Зареждат се последните 1000.
              </p>

              <div className="recordGrid">
                {filtered.map((b) => (
                  <article
                    className="recordCard"
                    key={b.id}
                  >
                    <div className="recordTop">
                      <h2>{b.customer_name}</h2>
                      <span>
                        {b.salon === "haskovo"
                          ? "Хасково"
                          : b.salon === "plovdiv"
                            ? "Пловдив"
                            : b.salon}
                      </span>
                    </div>

                    <p>
                      <strong>{b.offering}</strong>
                    </p>

                    {b.scheduled_course_id && (
                      <p>
                        <small>
                          Заявка за обявена дата от графика
                        </small>
                      </p>
                    )}

                    <p>
                      {b.preferred_date}
                      {" · "}
                      {b.preferred_time}
                    </p>

                    <p>
                      <a
                        href={`tel:${b.phone.replace(
                          /[^+\d]/g,
                          ""
                        )}`}
                      >
                        {b.phone}
                      </a>

                      {b.email && (
                        <>
                          {" · "}
                          <a href={`mailto:${b.email}`}>
                            {b.email}
                          </a>
                        </>
                      )}
                    </p>

                    {b.final_price != null && (
                      <p className="priceSummary">
                        {b.discount_percent ? (
                          <>
                            Цена:{" "}
                            {euro(Number(b.original_price))}
                            {" · "}−{b.discount_percent}%
                            {" · "}
                          </>
                        ) : null}

                        <strong>
                          Крайна цена:{" "}
                          {euro(Number(b.final_price))}
                        </strong>
                      </p>
                    )}

                    {b.note && (
                      <p className="prewrap">{b.note}</p>
                    )}

                    <label>
                      Статус
                      <select
                        value={b.admin_status || "new"}
                        disabled={busy}
                        onChange={(e) =>
                          void bookingStatus(
                            b,
                            e.target.value
                          )
                        }
                      >
                        {Object.entries(statuses).map(
                          ([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </article>
                ))}
              </div>

              {!filtered.length && (
                <p>Няма заявки по избраните филтри.</p>
              )}
            </>
          )}

          {tab === "reviews" && (
            <>
              <div className="adminFilters">
                <select
                  aria-label="Филтър на отзиви"
                  value={reviewFilter}
                  onChange={(e) =>
                    setReviewFilter(e.target.value)
                  }
                >
                  <option value="all">
                    Всички отзиви
                  </option>
                  <option value="pending">
                    Чакащи одобрение
                  </option>
                  <option value="approved">
                    Публикувани
                  </option>
                </select>
              </div>

              <p>
                Заредени са последните {reviews.length}{" "}
                отзива (до 1000).
              </p>

              <div className="recordGrid">
                {reviews
                  .filter(
                    (r) =>
                      reviewFilter === "all" ||
                      (
                        reviewFilter === "approved"
                          ? r.approved
                          : !r.approved
                      )
                  )
                  .map((r) => (
                    <article
                      className="recordCard"
                      key={r.id}
                    >
                      <div className="recordTop">
                        <h2>{r.customer_name}</h2>
                        <span>{r.rating}/5</span>
                      </div>

                      <small>
                        {r.approved
                          ? "Публикуван"
                          : "Чака одобрение"}
                      </small>

                      <p className="prewrap">
                        {r.comment}
                      </p>

                      <div className="rowActions">
                        <button
                          disabled={busy}
                          onClick={() =>
                            void reviewUpdate(r)
                          }
                        >
                          {r.approved
                            ? "Скрий"
                            : "Одобри и публикувай"}
                        </button>

                        <button
                          className="danger"
                          disabled={busy}
                          onClick={() =>
                            void reviewUpdate(r, true)
                          }
                        >
                          Изтрий
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </>
          )}

          {content &&
            ["courses", "services", "team"].includes(tab) && (
              <div className="editorLayout">
                <aside className="itemList">
                  {(
                    tab === "courses"
                      ? content.courses.map((c) => [
                          c.id,
                          `${c.title} ${c.subtitle}`,
                        ])
                      : tab === "services"
                        ? content.services.map((s) => [
                            s.id,
                            s.title,
                          ])
                        : content.team.map((m, i) => [
                            String(i),
                            m.name,
                          ])
                  ).map(([id, title], i) => (
                    <button
                      key={id}
                      aria-pressed={selected === i}
                      onClick={() => setSelected(i)}
                    >
                      {String(i + 1).padStart(2, "0")}
                      {" / "}
                      {title}
                    </button>
                  ))}
                </aside>

                <section className="editorPanel">
                  <fieldset disabled={busy}>
                    {selected < 0 ? (
                      <p>
                        Избери запис от списъка или
                        натисни „Добави“.
                      </p>
                    ) : (
                      <>
                        <div className="rowActions">
                          <button
                            onClick={() => move(-1)}
                          >
                            ↑ Нагоре
                          </button>

                          <button
                            onClick={() => move(1)}
                          >
                            ↓ Надолу
                          </button>

                          <button
                            className="danger"
                            onClick={remove}
                          >
                            Премахни
                          </button>
                        </div>

                        {tab === "courses" && course && (
                          <div className="editorFields">
                            <Field
                              label="Заглавие"
                              value={course.title}
                              onChange={(v) =>
                                courseField("title", v)
                              }
                            />

                            <Field
                              label="Втори ред на заглавието"
                              value={course.subtitle}
                              onChange={(v) =>
                                courseField("subtitle", v)
                              }
                            />

                            <Field
                              label="Етикет"
                              value={course.label}
                              onChange={(v) =>
                                courseField("label", v)
                              }
                            />

                            <Field
                              label="Продължителност / информация"
                              value={course.meta}
                              onChange={(v) =>
                                courseField("meta", v)
                              }
                            />

                            <Field
                              label="Преподавател"
                              value={course.instructor}
                              onChange={(v) =>
                                courseField("instructor", v)
                              }
                            />

                            <Field
                              label="Снимка — път или HTTPS адрес"
                              value={course.image}
                              onChange={(v) =>
                                courseField("image", v)
                              }
                            />

                            <Field
                              label="Описание на снимката"
                              value={course.imageAlt}
                              onChange={(v) =>
                                courseField("imageAlt", v)
                              }
                            />

                            <Field
                              label="Тагове — разделени със запетая"
                              value={course.tags.join(", ")}
                              onChange={(v) =>
                                courseField(
                                  "tags",
                                  v
                                    .split(",")
                                    .map((x) => x.trim())
                                )
                              }
                            />

                            <Field
                              label="Кратко описание"
                              value={course.description}
                              multiline
                              onChange={(v) =>
                                courseField(
                                  "description",
                                  v
                                )
                              }
                            />

                            <Field
                              label="Програма — по един абзац на ред"
                              value={course.program}
                              multiline
                              onChange={(v) =>
                                courseField("program", v)
                              }
                            />

                            <div className="wide">
                              <h3>Цени в евро</h3>
                              <p>
                                Отстъпката от 5% се
                                изчислява автоматично за
                                записвания през сайта.
                              </p>

                              {course.variants.map(
                                (v, i) => (
                                  <div
                                    className="variantRow"
                                    key={i}
                                  >
                                    <input
                                      aria-label="Вариант / продължителност"
                                      value={v.label}
                                      onChange={(e) =>
                                        courseField(
                                          "variants",
                                          course.variants.map(
                                            (x, j) =>
                                              j === i
                                                ? {
                                                    ...x,
                                                    label:
                                                      e.target
                                                        .value,
                                                  }
                                                : x
                                          )
                                        )
                                      }
                                    />

                                    <input
                                      aria-label="Цена в евро"
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={v.price}
                                      onChange={(e) =>
                                        courseField(
                                          "variants",
                                          course.variants.map(
                                            (x, j) =>
                                              j === i
                                                ? {
                                                    ...x,
                                                    price:
                                                      e.target
                                                        .value ===
                                                      ""
                                                        ? 0
                                                        : Number(
                                                            e
                                                              .target
                                                              .value
                                                          ),
                                                  }
                                                : x
                                          )
                                        )
                                      }
                                    />

                                    <button
                                      disabled={
                                        course.variants
                                          .length === 1
                                      }
                                      onClick={() =>
                                        courseField(
                                          "variants",
                                          course.variants.filter(
                                            (_, j) =>
                                              i !== j
                                          )
                                        )
                                      }
                                    >
                                      Премахни
                                    </button>
                                  </div>
                                )
                              )}

                              <button
                                onClick={() =>
                                  courseField("variants", [
                                    ...course.variants,
                                    {
                                      label: "Нов вариант",
                                      price: 0,
                                    },
                                  ])
                                }
                              >
                                + Ценови вариант
                              </button>
                            </div>
                          </div>
                        )}

                        {tab === "services" && service && (
                          <div className="editorFields">
                            <Field
                              label="Направление / заглавие"
                              value={service.title}
                              onChange={(v) =>
                                serviceField("title", v)
                              }
                            />

                            <Field
                              label="Роля на специалист — част от наименованието"
                              value={service.specialistRole}
                              onChange={(v) =>
                                serviceField(
                                  "specialistRole",
                                  v
                                )
                              }
                            />

                            <Field
                              label="Снимка — път или HTTPS адрес"
                              value={service.image}
                              onChange={(v) =>
                                serviceField("image", v)
                              }
                            />

                            <Field
                              label="Описание на снимката"
                              value={service.alt}
                              onChange={(v) =>
                                serviceField("alt", v)
                              }
                            />

                            <Field
                              label="Описание"
                              value={service.description}
                              multiline
                              onChange={(v) =>
                                serviceField(
                                  "description",
                                  v
                                )
                              }
                            />

                            <Field
                              label="Процедури — по една на ред"
                              value={service.items.join("\n")}
                              multiline
                              onChange={(v) =>
                                serviceField(
                                  "items",
                                  v.split("\n")
                                )
                              }
                            />

                            <div className="wide">
                              <h3>
                                Цени на процедурите в евро
                              </h3>
                              <p>
                                Остави празно за цена
                                по запитване.
                              </p>

                              {service.items.map(
                                (item, i) => (
                                  <label key={i}>
                                    <span>
                                      {item || "Процедура"}
                                    </span>

                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        service.itemPrices[
                                          item
                                        ] ?? ""
                                      }
                                      onChange={(e) =>
                                        serviceField(
                                          "itemPrices",
                                          {
                                            ...service.itemPrices,
                                            [item]:
                                              e.target
                                                .value ===
                                              ""
                                                ? null
                                                : Number(
                                                    e.target
                                                      .value
                                                  ),
                                          }
                                        )
                                      }
                                    />
                                  </label>
                                )
                              )}
                            </div>
                          </div>
                        )}

                        {tab === "team" && member && (
                          <div className="editorFields">
                            <Field
                              label="Име и фамилия"
                              value={member.name}
                              onChange={(v) =>
                                memberField("name", v)
                              }
                            />

                            <Field
                              label="Роля — напр. Козметик и масажист"
                              value={member.role}
                              onChange={(v) =>
                                memberField("role", v)
                              }
                            />

                            <label>
                              <span>Град</span>
                              <select
                                value={member.city}
                                onChange={(e) =>
                                  memberField(
                                    "city",
                                    e.target.value
                                  )
                                }
                              >
                                {[
                                  "Хасково",
                                  "Пловдив",
                                  "Хасково и Пловдив",
                                ].map((c) => (
                                  <option key={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <Field
                              label="Телефон"
                              value={member.phone}
                              onChange={(v) =>
                                memberField("phone", v)
                              }
                            />

                            <Field
                              label="Номер за директно обаждане"
                              value={member.tel}
                              onChange={(v) =>
                                memberField("tel", v)
                              }
                            />

                            <Field
                              label="Снимка — път или HTTPS адрес"
                              value={member.image}
                              onChange={(v) =>
                                memberField("image", v)
                              }
                            />

                            <Field
                              label="Описание"
                              value={
                                member.description ?? ""
                              }
                              multiline
                              onChange={(v) =>
                                memberField(
                                  "description",
                                  v
                                )
                              }
                            />
                          </div>
                        )}
                      </>
                    )}
                  </fieldset>
                </section>
              </div>
            )}
        </>
      )}
    </main>
  );
}