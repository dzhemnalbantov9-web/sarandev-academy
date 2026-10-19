"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createClient } from "@supabase/supabase-js";

/* ================= ТИПОВЕ ================= */

type ModalName =
  | "sofia"
  | "manicure"
  | "lashes"
  | "lash-basic"
  | "manicure-advanced"
  | "service-0"
  | "service-1"
  | "service-2"
  | "service-3"
  | null;

type TeamMember = {
  name: string;
  role: string;
  city: string;
  phone: string;
  tel: string;
  image: string;
  description?: string;
};

type GalleryPhoto = {
  src: string;
  fallbacks?: string[];
  category: string;
  title: string;
  alt: string;
};

type Review = {
  id: string;
  customer_name: string;
  rating: number;
  comment: string;
};

/* ================= КОНТАКТИ И СНИМКИ ================= */

const academyPhone = "0876 667 797";
const academyTel = "+359876667797";
const gulselPhoto = "/images/team/gulsel.jfif";

const gulselFallbacks = [
  "/images/team/gulsel.jpg",
  "/images/team/gulsel.jpeg",
  "/images/team/gulsel.png",
  "/images/team/gulsel.webp",
  "/images/gulsel.jfif",
  "/images/gulsel.jpg",
  "/images/gulsel.jpeg",
  "/images/gulsel.png",
  "/images/gulsel.webp",
  "/gulsel.jfif",
  "/gulsel.jpg",
  "/gulsel.jpeg",
  "/gulsel.png",
  "/gulsel.webp",
];

const biography = [
  "София Сарандева е основател на Sarandev Academy, успешен професионалист в бюти индустрията с над 7 години опит и собственик на два утвърдени салона за красота.",
  "Водена от своята страст към красотата и непрестанното усъвършенстване, тя е преминала през над 40 професионални обучения, надграждайки своите знания, умения и техники при доказани специалисти в бранша.",
  "Нейният талант, упоритост и професионализъм са отличени на престижни международни състезания и форуми в Абу Даби, Лондон и България, където завоюва призови места и престижни награди.",
  "Днес София успешно предава натрупаните знания и опит чрез Sarandev Academy, вдъхновявайки и обучавайки бъдещи професионалисти в сферата на красотата.",
  "Зад успеха ѝ стоят множество доволни клиенти, успешно реализирани обучения и курсисти, които ѝ се доверяват по пътя към своето професионално развитие.",
  "За София красотата не е просто професия – тя е страст, призвание и мисия да създава уверени, знаещи и успешни специалисти!",
];

const team: TeamMember[] = [
  {
    name: "София Сарандева",
    role: "Основател и преподавател",
    city: "Хасково и Пловдив",
    phone: academyPhone,
    tel: academyTel,
    image: "/images/sofia.jpg",
    description:
      "Провежда професионални обучения в Sarandev Academy в Хасково и Пловдив.",
  },
  {
    name: "Гергана Панайотова",
    role: "Маникюрист",
    city: "Хасково",
    phone: "087 898 8694",
    tel: "+359878988694",
    image: "/images/team/gergana.jfif",
  },
  {
    name: "Даниела Конарова",
    role: "Миглостилист",
    city: "Хасково",
    phone: "088 614 5337",
    tel: "+359886145337",
    image: "/images/team/daniela.jfif",
  },
  {
    name: "Аделина Иванова",
    role: "Маникюрист",
    city: "Пловдив",
    phone: "+359 89 453 5398",
    tel: "+359894535398",
    image: "/images/team/adelina.jfif",
  },
  {
    name: "Мерлин Георгиева",
    role: "Миглостилист",
    city: "Пловдив",
    phone: "+359 89 782 6675",
    tel: "+359897826675",
    image: "/images/team/merlin.jfif",
  },
];

function teamPhotoFallbacks(member: TeamMember) {
  if (member.name === "София Сарандева") {
    return ["/images/sSofia.jpg", "/sSofia.jpg", "/sofia.jpg"];
  }

  const filename = member.image.split("/").pop() ?? "";
  const name = filename.replace(/\.[^.]+$/, "");

  return [
    `/images/team/${name}.jpg`,
    `/images/team/${name}.jpeg`,
    `/images/team/${name}.png`,
    `/images/${name}.jfif`,
    `/images/${name}.jpg`,
    `/images/${name}.png`,
    `/${name}.jfif`,
    `/${name}.jpg`,
  ];
}

/* ================= УСЛУГИ ================= */

const aestheticServices = [
  "Устни",
  "Скули",
  "Jawline",
  "Корекция на нос",
  "Брадичка",
  "Микроблейдинг",
];

const services = [
  {
    id: "service-0" as const,
    title: "Маникюр & педикюр",
    description: "Малките детайли правят голямото впечатление.",
    image: "/images/manicure.png",
    alt: "Илюстративна снимка на маникюр",
    items: [
      "Маникюр с гел лак",
      "Маникюр — поддръжка",
      "Изграждане",
      "Педикюр",
      "Спа педикюр",
    ],
  },
  {
    id: "service-1" as const,
    title: "Миглопластика",
    description: "Подчертай своя поглед. Запази своя характер.",
    image: "/images/lashes.png",
    alt: "Илюстративна снимка на миглопластика",
    items: [
      "Косъм по косъм",
      "2–3D обемни мигли",
      "Мега обем",
      "Wispy ефект",
      "Очна линия",
      "Арабски ефект",
    ],
  },
  {
    id: "service-2" as const,
    title: "Козметика",
    description: "Грижа за кожата. Време само за теб.",
    image: "/images/cosmetics.png",
    alt: "Илюстративна снимка на козметична процедура",
    items: [
      "Почистване на лице",
      "Кола маска — цяло тяло",
      "Кола маска — вежди",
      "RF кавитация",
      "Пресотерапия",
    ],
  },
  {
    id: "service-3" as const,
    title: "Естетична корекция",
    description: "С Гюнюл Мерт — гостува всеки месец от Турция.",
    image: gulselPhoto,
    alt: "Гюнюл Мерт",
    items: aestheticServices,
  },
];

/* ================= ЧЕТИРИ ОБУЧЕНИЯ ================= */

const courses = [
  {
    id: "manicure" as const,
    label: "БАЗОВО ОБУЧЕНИЕ",
    image: "/images/course-manicure.png",
    imageAlt: "Илюстративна снимка на маникюристка по време на работа",
    meta: "3 МОДУЛА / 5 ДНИ",
    title: "Базов курс",
    subtitle: "„Маникюр“",
    description:
      "От първите движения до завършената работа. Теория и практика в три основни направления.",
    tags: ["Маникюр", "Педикюр", "Ноктопластика"],
    price: "1 300 €",
    priceNote: "за трите модула",
  },
  {
    id: "lashes" as const,
    label: "ПРОФЕСИОНАЛНО ОБУЧЕНИЕ",
    image: "/images/course-lashes.png",
    imageAlt: "Илюстративна снимка на миглостилистка по време на работа",
    meta: "ТЕОРИЯ + ПРАКТИКА / 1 ИЛИ 2 ДНИ",
    title: "Ламиниране",
    subtitle: "на мигли",
    description:
      "Естествено красиви, извити и подхранени мигли. Научи техниката с внимание към всеки детайл.",
    tags: ["Работа върху модел", "Фирмен сертификат"],
    price: "300 €",
    priceNote: "1 ден / 2 дни — 450 €",
  },
  {
    id: "lash-basic" as const,
    label: "БАЗОВО ОБУЧЕНИЕ",
    image: "/images/course-lashes.png",
    imageAlt: "Илюстративна снимка на поставяне на мигли",
    meta: "4 ДНИ / ТЕОРИЯ + ПРАКТИКА",
    title: "Базов курс",
    subtitle: "по миглопластика",
    description:
      "От теорията до работата върху модел: косъм по косъм, обемни мигли, ръчни снопчета и ламиниране.",
    tags: ["Осигурени материали", "Индивидуално или до 3 курсистки"],
    price: "800 €",
    priceNote: "за четиридневното обучение",
  },
  {
    id: "manicure-advanced" as const,
    label: "НАДГРАЖДАЩО ОБУЧЕНИЕ",
    image: "/images/course-manicure.png",
    imageAlt: "Илюстративна снимка на професионална работа по маникюр",
    meta: "2 ДНИ / ТЕХНИКА И ПРЕЦИЗНОСТ",
    title: "Надграждащо",
    subtitle: "обучение по маникюр",
    description:
      "Усъвършенствай пиленето, изграждането, комбинирания маникюр и прецизното лакиране. Развий и своето професионално присъствие.",
    tags: ["Практически техники", "Фирмен сертификат"],
    price: "500 €",
    priceNote: "за двудневното обучение",
  },
];

const courseOptions = [
  "Базов курс „Маникюр“ — 3 модула / 1 300 €",
  "Ламиниране на мигли — 1 ден / 300 €",
  "Ламиниране на мигли — 2 дни / 450 €",
  "Базов курс по миглопластика — 4 дни / 800 €",
  "Надграждащо обучение по маникюр — 2 дни / 500 €",
];

const serviceOptions = services.flatMap((group) =>
  group.items.map((item) =>
    group.id === "service-1"
      ? `Миглопластика — ${item}`
      : group.id === "service-3"
        ? `Естетична корекция — ${item}`
        : item
  )
);

const lashTheory = [
  "Анатомия и структура на естествените мигли",
  "Фази на растеж и жизнен цикъл на миглите",
  "Какво представлява ламинирането и как действа",
  "Професионални продукти и тяхното приложение",
  "Видове силиконови подложки и подбор според формата на окото",
  "Анализ на естествените мигли и избор на подходяща техника",
  "Последователност на процедурата и време на действие на продуктите",
  "Боядисване и подхранване на миглите",
  "Хигиена, дезинфекция и безопасност",
  "Противопоказания и възможни алергични реакции",
  "Най-често допускани грешки и как да ги избегнем",
  "Последваща грижа и препоръки към клиента",
];

const lashPractice = [
  "Подготовка на работното място и клиента",
  "Демонстрация на процедурата от преподавателя",
  "Правилно поставяне на силиконови подложки",
  "Прецизно подреждане и фиксиране на миглите",
  "Нанасяне и отстраняване на професионалните продукти",
  "Боядисване и финална подхранваща грижа",
  "Самостоятелна работа върху реален модел под наблюдение",
  "Анализ на резултата и индивидуални насоки за усъвършенстване",
];

const locations = [
  {
    id: "haskovo",
    city: "Хасково",
    address: "ул. „Преслав“ № 23",
    query: "Хасково улица Преслав 23",
  },
  {
    id: "plovdiv",
    city: "Пловдив",
    address: "ул. „Петко Д. Петков“ № 74",
    query: "Пловдив улица Петко Д. Петков 74",
  },
];

/* ================= ГАЛЕРИЯ ================= */

const galleryPhotos: GalleryPhoto[] = [
  {
    src: "/images/gallery/gallery-01.jpg",
    category: "Академия",
    title: "Практика в академията",
    alt: "Курсистки упражняват маникюр в академията",
  },
  {
    src: "/images/gallery/gallery-02.jpg",
    category: "Маникюр",
    title: "Нежност в детайла",
    alt: "Нежен розов маникюр със сини акценти",
  },
  {
    src: "/images/gallery/gallery-03.jpg",
    category: "Мигли",
    title: "Изразителен поглед",
    alt: "Близък план на оформени мигли и вежди",
  },
  {
    src: "/images/gallery/gallery-04.jpg",
    category: "Академия",
    title: "Едно ново начало",
    alt: "София с курсистка след успешно завършен курс",
  },
  {
    src: "/images/gallery/gallery-05.jpg",
    category: "Академия",
    title: "Светът на академията",
    alt: "София с професионални инструменти",
  },
  {
    src: "/images/gallery/gallery-06.jpg",
    category: "Мигли",
    title: "Обем и прецизност",
    alt: "Детайл на обемна миглопластика",
  },
  {
    src: "/images/gallery/gallery-07.jpg",
    category: "Мигли",
    title: "Красота отблизо",
    alt: "Резултат от оформяне на мигли",
  },
  {
    src: "/images/gallery/gallery-08.jpg",
    category: "Академия",
    title: "Споделени успехи",
    alt: "София и курсистка със сертификат",
  },
  {
    src: "/images/gallery/gallery-09.jpg",
    category: "Маникюр",
    title: "Умението идва с практика",
    alt: "Практическа работа с електрическа пила",
  },
  {
    src: "/images/gallery/gallery-10.jpg",
    category: "Академия",
    title: "Следващата стъпка",
    alt: "София и курсистки със сертификати",
  },
  {
    src: "/images/gallery/snimka1.jfif",
    category: "Маникюр",
    title: "Прецизност във всяко движение",
    alt: "Работа по маникюр с професионални инструменти",
  },
  {
    src: "/images/gallery/snimka2.jfif",
    category: "Маникюр",
    title: "Класически френски маникюр",
    alt: "Френски маникюр с нежна розова основа и бели връхчета",
  },
  {
    src: "/images/gallery/snimka3.jfif",
    category: "Академия",
    title: "Още един споделен успех",
    alt: "Обща снимка със сертификати от Sarandev Academy",
  },
  {
    src: "/images/gallery/snimka4.jfif",
    category: "Мигли",
    title: "Акцент върху погледа",
    alt: "Близък план на оформени мигли",
  },
  {
    src: "/images/gallery/snimka5.jfif",
    category: "Маникюр",
    title: "Нежност в розово",
    alt: "Нежен розов маникюр с квадратна форма",
  },
  {
    src: "/images/gallery/snimka6.jfif",
    category: "Педикюр",
    title: "Грижа до последния детайл",
    alt: "Педикюр в светъл розов нюанс с фин блясък",
  },
  {
    src: "/images/gallery/snimka7.jfif",
    category: "Маникюр",
    title: "Розов акцент и фин блясък",
    alt: "Маникюр с яркорозови и нежни блестящи нокти",
  },
  {
    src: "/images/gallery/snimka8.jfif",
    category: "Маникюр",
    title: "Класика в червено",
    alt: "Червен маникюр с гланцов завършек",
  },
];

const correctionPhotos: GalleryPhoto[] = Array.from(
  { length: 6 },
  (_, index) => {
    const number = index + 1;
    const originalName =
      number === 1 ? "corrections.jfif" : `corrections-${number}.jfif`;

    return {
      src: `/images/corrections/${originalName}`,
      fallbacks: [
        `/images/corrections/correction-${String(number).padStart(2, "0")}.jfif`,
      ],
      category: "Естетична корекция",
      title: `Работа на Гюнюл Мерт — ${String(number).padStart(2, "0")}`,
      alt: `Снимка от работата на Гюнюл Мерт ${number}`,
    };
  }
);

/* ================= СОЦИАЛНИ МРЕЖИ ================= */

const socialLinks = [
  {
    id: "instagram" as const,
    name: "Instagram",
    label: "ПОСЛЕДВАЙ НИ",
    href: "https://www.instagram.com/sarandevaacademy/",
  },
  {
    id: "facebook" as const,
    name: "Facebook",
    label: "ОТКРИЙ НОВОСТИТЕ",
    href: "https://www.facebook.com/profile.php?id=100075512754620",
  },
  {
    id: "tiktok" as const,
    name: "TikTok",
    label: "ВИЖ НИ В ДЕЙСТВИЕ",
    href: "https://www.tiktok.com/@sofiyasarandeva.academy",
  },
];

function SocialIcon({ name }: { name: "instagram" | "facebook" | "tiktok" }) {
  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="5"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle
          cx="12"
          cy="12"
          r="4"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }

  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4V10H8v3h2.9v8H14Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 3c.3 2.3 1.6 3.7 4 3.9v3.2a9 9 0 0 1-4-1.2v6.4a6 6 0 1 1-5.2-5.9v3.3a2.8 2.8 0 1 0 2 2.6V3h3.2Z" />
    </svg>
  );
}

/* ================= ПОМОЩНИ ФУНКЦИИ ================= */

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Услугата временно не е достъпна.");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function todayInSofia() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Sofia",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const part = (type: string) =>
    parts.find((item) => item.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

/* ================= СНИМКИ ================= */

function Photo({
  src,
  alt,
  fallbacks = [],
  className = "",
  eager = false,
}: {
  src: string;
  alt: string;
  fallbacks?: string[];
  className?: string;
  eager?: boolean;
}) {
  const candidateKey = JSON.stringify([src, ...fallbacks]);

  const [status, setStatus] = useState({
    key: candidateKey,
    attempt: 0,
  });

  const attempt = status.key === candidateKey ? status.attempt : 0;
  const sources = JSON.parse(candidateKey) as string[];
  const currentSource = sources[attempt];

  if (!currentSource) {
    return (
      <span className={`photoFallback ${className}`}>
        <small>{alt}</small>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={currentSource}
      src={currentSource}
      alt={alt}
      className={className}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => {
        setStatus((previous) => ({
          key: candidateKey,
          attempt:
            previous.key === candidateKey ? previous.attempt + 1 : 1,
        }));
      }}
    />
  );
}

/* ================= ПРОЗОРЕЦ ================= */

function Dialog({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const dialog = ref.current;
    if (!dialog) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    if (!dialog.open) dialog.showModal();

    dialog.scrollTop = 0;
    document.body.style.overflow = "hidden";

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`saDialog ${wide ? "saDialogWide" : ""}`}
      aria-labelledby={titleId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {open && (
        <>
          <div className="dialogBar">
            <span id={titleId}>{title}</span>
            <button type="button" onClick={onClose} autoFocus>
              Затвори <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="dialogBody">{children}</div>
        </>
      )}
    </dialog>
  );
}

/* ================= ГАЛЕРИЯ ================= */

function PhotoGallery({
  photos,
  filters = false,
  compact = false,
}: {
  photos: GalleryPhoto[];
  filters?: boolean;
  compact?: boolean;
}) {
  const [category, setCategory] = useState("Всички");
  const [active, setActive] = useState<number | null>(null);
  const touchStart = useRef<number | null>(null);

  const categories = [
    "Всички",
    ...Array.from(new Set(photos.map((photo) => photo.category))),
  ];

  const visible = photos.filter(
    (photo) => category === "Всички" || category === photo.category
  );

  const current = active === null ? null : visible[active] ?? null;

  function move(direction: number) {
    setActive((index) =>
      index === null || visible.length === 0
        ? null
        : (index + direction + visible.length) % visible.length
    );
  }

  return (
    <div className={`photoGallery ${compact ? "compactGallery" : ""}`}>
      {filters && (
        <div className="galleryToolbar">
          <div className="filterButtons" aria-label="Категории">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => {
                  setActive(null);
                  setCategory(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <span className="galleryCount">{visible.length} КАДЪРА</span>
        </div>
      )}

      <div className="galleryGrid">
        {visible.map((photo, index) => (
          <button
            type="button"
            key={photo.src}
            className="galleryCard"
            onClick={() => setActive(index)}
            aria-label={`Отвори: ${photo.title}`}
            aria-haspopup="dialog"
          >
            <Photo
              src={photo.src}
              fallbacks={photo.fallbacks}
              alt={photo.alt}
            />
            <span className="galleryShade" />
            <span className="galleryNumber">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="galleryExpand" aria-hidden="true">↗</span>
            <span className="galleryCaption">
              <small>{photo.category}</small>
              <strong>{photo.title}</strong>
              <span>Разгледай снимката ↗</span>
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={current !== null}
        onClose={() => setActive(null)}
        title={current?.title ?? "Галерия"}
        wide
      >
        {current && (
          <div
            className="galleryViewer"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(-1);
              }
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(1);
              }
            }}
            onTouchStart={(event) => {
              touchStart.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current;
              const end = event.changedTouches[0]?.clientX;
              touchStart.current = null;

              if (
                start !== null &&
                end !== undefined &&
                Math.abs(start - end) > 55
              ) {
                move(start > end ? 1 : -1);
              }
            }}
          >
            <Photo
              key={current.src}
              src={current.src}
              fallbacks={current.fallbacks}
              alt={current.alt}
              eager
            />

            {visible.length > 1 && (
              <>
                <button
                  className="viewerPrevious"
                  type="button"
                  onClick={() => move(-1)}
                  aria-label="Предишна снимка"
                >
                  ←
                </button>
                <button
                  className="viewerNext"
                  type="button"
                  onClick={() => move(1)}
                  aria-label="Следваща снимка"
                >
                  →
                </button>
              </>
            )}

            <div className="viewerCaption" aria-live="polite">
              <span>{current.title}</span>
              <span>{(active ?? 0) + 1} / {visible.length}</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

/* ================= ЕКИП ================= */

function TeamSection({ onSofia }: { onSofia: () => void }) {
  const [city, setCity] = useState("Всички");

  const visible = team.filter(
    (member) => city === "Всички" || member.city.includes(city)
  );

  return (
    <section id="team" className="section teamSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">ХОРАТА ЗАД КРАСОТАТА</p>
          <h2>Нашият екип.<br /><em>Твоето доверие.</em></h2>
        </div>
        <p className="sectionIntro">
          Запознай се със специалистите в Хасково и Пловдив.
          Свържи се директно с тях за записване.
        </p>
      </div>

      <div className="filterButtons teamFilters" aria-label="Екип по град">
        {["Всички", "Хасково", "Пловдив"].map((item) => (
          <button
            type="button"
            key={item}
            aria-pressed={city === item}
            onClick={() => setCity(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="teamGrid">
        {visible.map((member) => (
          <article className="teamCard" key={member.name}>
            <div className="teamPhoto">
              <Photo
                src={member.image}
                fallbacks={teamPhotoFallbacks(member)}
                alt={member.name}
              />
              <span className="cityBadge">{member.city}</span>
            </div>

            <div className="teamBody">
              <p className="teamRole">{member.role}</p>
              <h3>{member.name}</h3>

              {member.description && (
                <p className="teamDescription">{member.description}</p>
              )}

              <a className="teamPhone" href={`tel:${member.tel}`}>
                {member.phone} <span aria-hidden="true">↗</span>
              </a>

              {member.name === "София Сарандева" && (
                <button
                  type="button"
                  className="textLink"
                  onClick={onSofia}
                  aria-haspopup="dialog"
                >
                  Повече за София ↗
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ================= ГОСТУВАЩ СПЕЦИАЛИСТ ================= */

function GuestSection() {
  return (
    <section id="aesthetics" className="guestSection">
      <div className="guestIntro">
        <div className="guestPortrait">
          <Photo
            src={gulselPhoto}
            fallbacks={gulselFallbacks}
            alt="Гюнюл Мерт — естетична корекция"
          />
          <span className="guestPortraitLabel">GUEST / BEAUTY</span>
        </div>

        <div className="guestCopy">
          <p className="eyebrow">ГОСТУВА НИ ВСЕКИ МЕСЕЦ ОТ ТУРЦИЯ</p>
          <h2>Гюнюл Мерт.<br /><em>Естетична корекция.</em></h2>

          <p className="guestDescription">
            Всеки месец Гюнюл Мерт гостува в нашите салони
            в Хасково и Пловдив.
          </p>

          <div className="guestCities">
            <span>Хасково</span><span>Пловдив</span>
          </div>

          <div className="guestServices">
            {aestheticServices.map((item) => <span key={item}>{item}</span>)}
          </div>

          <div className="productNote">
            <span>ФИЛЪР, С КОЙТО РАБОТИ</span>
            <strong>Elasty</strong>
          </div>

          <p className="guestNote">
            Датите на гостуване и свободните часове се уточняват
            предварително при записване.
          </p>

          <a href="#booking" className="button goldButton">
            Изпрати запитване <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="guestPortfolio">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">ОТ НЕЙНАТА РАБОТА</p>
            <h3>Резултатите.<br /><em>Отблизо.</em></h3>
          </div>
          <p className="sectionIntro">
            Част от работата на Гюнюл Мерт.
            Натисни върху снимка, за да я разгледаш.
          </p>
        </div>

        <PhotoGallery photos={correctionPhotos} compact />
      </div>
    </section>
  );
}

/* ================= ОТЗИВИ ================= */

function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      try {
        const { data, error: databaseError } = await getSupabaseClient()
          .from("reviews")
          .select("id, customer_name, rating, comment")
          .eq("approved", true)
          .order("created_at", { ascending: false })
          .limit(12);

        if (databaseError) throw databaseError;

        const valid = (data ?? []).filter(
          (review) =>
            typeof review.id === "string" &&
            typeof review.customer_name === "string" &&
            typeof review.comment === "string" &&
            Number.isInteger(review.rating) &&
            review.rating >= 1 &&
            review.rating <= 5
        ) as Review[];

        if (active) setReviews(valid);
      } catch {
        if (active) {
          setLoadError("Отзивите временно не могат да се заредят.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, []);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;

    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const customerName = String(data.get("customer_name") ?? "").trim();
    const comment = String(data.get("comment") ?? "").trim();
    const rating = Number(data.get("rating"));

    if (customerName.length < 2 || customerName.length > 100) {
      setError("Въведи име между 2 и 100 символа.");
      return;
    }

    if (comment.length < 10 || comment.length > 1500) {
      setError("Отзивът трябва да съдържа между 10 и 1500 символа.");
      return;
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Избери оценка от 1 до 5.");
      return;
    }

    submitLock.current = true;
    setSubmitting(true);

    try {
      const { error: databaseError } = await getSupabaseClient()
        .from("reviews")
        .insert({
          customer_name: customerName,
          rating,
          comment,
        });

      if (databaseError) throw databaseError;

      form.reset();
      setSuccess(
        "Благодарим ти! Отзивът е изпратен и ще се покаже след одобрение."
      );
    } catch {
      setError("Отзивът не беше изпратен. Опитай отново по-късно.");
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section id="reviews" className="section reviewsSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">ВАШИТЕ ВПЕЧАТЛЕНИЯ</p>
          <h2>Вашите думи.<br /><em>Нашето вдъхновение.</em></h2>
        </div>
        <p className="sectionIntro">
          Посещавала си наш салон или обучение?
          Сподели своето впечатление.
        </p>
      </div>

      {loading && <p role="status">Зареждане на отзивите…</p>}
      {loadError && <p role="status">{loadError}</p>}

      {!loading && !loadError && reviews.length === 0 && (
        <p className="reviewsNotice">
          Все още няма публикувани отзиви.
          Бъди първата, която споделя впечатление.
        </p>
      )}

      {reviews.length > 0 && (
        <div className="reviewsGrid">
          {reviews.map((review) => (
            <article className="reviewCard" key={review.id}>
              <p className="reviewRating">Оценка {review.rating} от 5</p>
              <p className="reviewText">{review.comment}</p>
              <h3>{review.customer_name}</h3>
            </article>
          ))}
        </div>
      )}

      <div className="formLayout reviewFormLayout">
        <div className="formAside">
          <p className="eyebrow">ОСТАВИ ОТЗИВ</p>
          <h3>Твоето мнение<br /><em>има значение.</em></h3>
          <p>Името, оценката и коментарът ще бъдат публични след одобрение.</p>
          <p>Не включвай телефон, имейл или други лични данни в коментара.</p>
        </div>

        <form className="saForm" onSubmit={submitReview}>
          <fieldset disabled={submitting}>
            <legend>ТВОЯТ ОТЗИВ</legend>

            <div className="formFields">
              <label>
                <span>Име *</span>
                <input
                  name="customer_name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  placeholder="Твоето име"
                  required
                />
              </label>

              <label>
                <span>Оценка *</span>
                <select name="rating" defaultValue="" required>
                  <option value="" disabled>Избери оценка</option>
                  <option value="5">5 от 5</option>
                  <option value="4">4 от 5</option>
                  <option value="3">3 от 5</option>
                  <option value="2">2 от 5</option>
                  <option value="1">1 от 5</option>
                </select>
              </label>

              <label className="fullWidth">
                <span>Твоят отзив *</span>
                <textarea
                  name="comment"
                  rows={5}
                  minLength={10}
                  maxLength={1500}
                  placeholder="Сподели своето впечатление…"
                  required
                />
              </label>
            </div>

            <p className="formPrivacy">
              Отзивите се публикуват след преглед и одобрение.
            </p>

            <button className="formSubmit" type="submit">
              {submitting ? "Изпращане…" : "Изпрати отзив"}
              <span>↗</span>
            </button>
          </fieldset>

          {error && (
            <p className="formMessage errorMessage" role="alert">{error}</p>
          )}
          {success && (
            <p className="formMessage successMessage" role="status">{success}</p>
          )}
        </form>
      </div>
    </section>
  );
}

/* ================= ЗАПИСВАНЕ ================= */

function BookingForm() {
  const [bookingType, setBookingType] = useState<"service" | "course">("service");
  const [salon, setSalon] = useState("");
  const [offering, setOffering] = useState("");
  const [specialist, setSpecialist] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submitLock = useRef(false);

  const options = bookingType === "service" ? serviceOptions : courseOptions;
  const city = locations.find((location) => location.id === salon)?.city;
  const isAesthetic = offering.startsWith("Естетична корекция");

  const availableSpecialists = team.filter((member) => {
    if (member.name === "София Сарандева") return false;
    if (city && !member.city.includes(city)) return false;

    if (services[0].items.includes(offering)) {
      return member.role === "Маникюрист";
    }

    if (offering.startsWith("Миглопластика")) {
      return member.role === "Миглостилист";
    }

    return false;
  });

  function changeType(type: "service" | "course") {
    setBookingType(type);
    setOffering("");
    setSpecialist("");
    setError("");
    setSuccess("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitLock.current) return;

    setError("");
    setSuccess("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const customerName = String(data.get("customer_name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const note = String(data.get("note") ?? "").trim();
    const preferredDate = String(data.get("preferred_date") ?? "");
    const preferredTime = String(data.get("preferred_time") ?? "");

    if (!locations.some((location) => location.id === salon)) {
      setError("Избери салон.");
      return;
    }

    if (!options.includes(offering)) {
      setError("Избери услуга или обучение.");
      return;
    }

    if (customerName.length < 2 || customerName.length > 100) {
      setError("Въведи име между 2 и 100 символа.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      setError("Въведи валиден телефон за връзка.");
      return;
    }

    if (!preferredDate || preferredDate < todayInSofia()) {
      setError("Избери днешна или бъдеща дата.");
      return;
    }

    if (!preferredTime) {
      setError("Посочи желан час.");
      return;
    }

    if (
      bookingType === "service" &&
      !isAesthetic &&
      specialist &&
      !availableSpecialists.some((member) => member.name === specialist)
    ) {
      setError("Избери специалист за избраните град и услуга.");
      return;
    }

    const selectedSpecialist =
      bookingType === "course"
        ? "София Сарандева"
        : isAesthetic
          ? "Гюнюл Мерт"
          : specialist;

    const finalNote = [
      selectedSpecialist ? `Специалист: ${selectedSpecialist}` : "",
      note,
    ].filter(Boolean).join("\n");

    submitLock.current = true;
    setSubmitting(true);

    try {
      const { error: databaseError } = await getSupabaseClient()
        .from("bookings")
        .insert({
          salon,
          booking_type: bookingType,
          offering,
          preferred_date: preferredDate,
          preferred_time: preferredTime,
          customer_name: customerName,
          phone,
          email: email || null,
          note: finalNote || null,
        });

      if (databaseError) {
        console.error("Booking error code:", databaseError.code);
        throw new Error(
          `Заявката не беше изпратена. Опитай отново или се обади на ${academyPhone}.`
        );
      }

      const selectedCity = city;

      form.reset();
      setSalon("");
      setOffering("");
      setSpecialist("");

      setSuccess(
        `Заявката ти за ${selectedCity} е изпратена успешно. ` +
        "Ще се свържем с теб за потвърждение. " +
        "Датата и часът все още не са резервирани."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Възникна грешка. Опитай отново."
      );
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  return (
    <section id="booking" className="section bookingSection">
      <div className="sectionHeading">
        <div>
          <p className="eyebrow">ТВОЯТА СЛЕДВАЩА СТЪПКА</p>
          <h2>Време за теб.<br /><em>Или за ново начало.</em></h2>
        </div>
        <p className="sectionIntro">
          Избери салон, услуга или обучение и ни изпрати
          предпочитаните дата и час.
        </p>
      </div>

      <div className="formLayout">
        <aside className="formAside">
          <p className="eyebrow">ЗАПИСВАНЕ В SARANDEV ACADEMY</p>
          <h3>Ти избираш.<br /><em>Ние потвърждаваме.</em></h3>

          <ol>
            <li>Избираш Хасково или Пловдив.</li>
            <li>Посочваш услуга или курс.</li>
            <li>Предлагаш удобни дата и час.</li>
            <li>Свързваме се с теб за потвърждение.</li>
          </ol>

          <div className="bookingNotice">
            <strong>Важно за записването</strong>
            <p>
              Това е заявка за предпочитан час. Записването е валидно
              след потвърждение.
            </p>
            <p>
              Обученията се провеждат от София Сарандева
              в Хасково и Пловдив.
            </p>
          </div>

          <a className="asidePhone" href={`tel:${academyTel}`}>
            {academyPhone} ↗
          </a>
        </aside>

        <form className="saForm" onSubmit={submitBooking}>
          <fieldset disabled={submitting}>
            <legend>ТВОЯТА ЗАЯВКА</legend>

            <div className="bookingTypeButtons">
              <button
                type="button"
                aria-pressed={bookingType === "service"}
                onClick={() => changeType("service")}
              >
                Услуга <span>↗</span>
              </button>
              <button
                type="button"
                aria-pressed={bookingType === "course"}
                onClick={() => changeType("course")}
              >
                Обучение <span>↗</span>
              </button>
            </div>

            <div className="formFields">
              <label className="fullWidth">
                <span>Салон *</span>
                <select
                  name="salon"
                  value={salon}
                  onChange={(event) => {
                    setSalon(event.target.value);
                    setSpecialist("");
                  }}
                  required
                >
                  <option value="">Избери салон</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.city} — {location.address}
                    </option>
                  ))}
                </select>
              </label>

              <label className="fullWidth">
                <span>{bookingType === "service" ? "Услуга *" : "Обучение *"}</span>
                <select
                  name="offering"
                  value={offering}
                  onChange={(event) => {
                    setOffering(event.target.value);
                    setSpecialist("");
                  }}
                  required
                >
                  <option value="">
                    {bookingType === "service" ? "Избери услуга" : "Избери обучение"}
                  </option>
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </label>

              {bookingType === "course" ? (
                <div className="formInfo fullWidth">
                  Преподавател: <strong>София Сарандева</strong>
                </div>
              ) : isAesthetic ? (
                <div className="formInfo fullWidth">
                  Специалист: <strong>Гюнюл Мерт</strong>.
                  Датата се уточнява според месечното гостуване.
                </div>
              ) : availableSpecialists.length > 0 ? (
                <label className="fullWidth">
                  <span>Предпочитан специалист — по желание</span>
                  <select
                    name="specialist"
                    value={specialist}
                    onChange={(event) => setSpecialist(event.target.value)}
                    disabled={!salon}
                  >
                    <option value="">
                      {salon ? "Без предпочитание" : "Първо избери салон"}
                    </option>
                    {availableSpecialists.map((member) => (
                      <option key={member.name} value={member.name}>
                        {member.name} — {member.role}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label>
                <span>
                  {bookingType === "course" ? "Желана начална дата *" : "Желана дата *"}
                </span>
                <input name="preferred_date" type="date" required />
              </label>

              <label>
                <span>Желан час *</span>
                <input name="preferred_time" type="time" step={900} required />
              </label>

              <p className="formHint fullWidth">
                Наличността се уточнява при потвърждение.
                За многодневен курс посочи желаната начална дата.
              </p>

              <label>
                <span>Име и фамилия *</span>
                <input
                  name="customer_name"
                  autoComplete="name"
                  minLength={2}
                  maxLength={100}
                  placeholder="Твоето име"
                  required
                />
              </label>

              <label>
                <span>Телефон *</span>
                <input
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  minLength={7}
                  maxLength={30}
                  placeholder="08..."
                  required
                />
              </label>

              <label className="fullWidth">
                <span>Имейл — по желание</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={254}
                  placeholder="name@example.com"
                />
              </label>

              <label className="fullWidth">
                <span>Бележка — по желание</span>
                <textarea
                  name="note"
                  rows={3}
                  maxLength={1500}
                  placeholder="Има ли нещо, което искаш да уточним?"
                />
              </label>
            </div>

            <p className="formPrivacy">
              Използваме предоставените данни за връзка с теб относно тази заявка.
            </p>

            <button type="submit" className="formSubmit">
              {submitting ? "Изпращане…" : "Изпрати заявка"}
              <span>↗</span>
            </button>
          </fieldset>

          {error && (
            <p className="formMessage errorMessage" role="alert">{error}</p>
          )}
          {success && (
            <p className="formMessage successMessage" role="status">{success}</p>
          )}
        </form>
      </div>
    </section>
  );
}

/* ================= СТРАНИЦА ================= */

export default function Home() {
  const [modal, setModal] = useState<ModalName>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const selectedService = services.find((service) => service.id === modal);
  const selectedCourse = courses.find((course) => course.id === modal);

  function openBooking() {
    setModal(null);

    window.requestAnimationFrame(() => {
      document.getElementById("booking")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
      });
    });
  }

  return (
    <main className="academy">
      <style>{styles}</style>

      <header className="header">
        <a href="#home" className="brand" aria-label="Sarandev Academy — начало">
          SARANDEV<span>ACADEMY</span>
        </a>

        <button
          className="menuToggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Затвори −" : "Меню +"}
        </button>

        <nav
          id="main-navigation"
          className={`navigation ${menuOpen ? "open" : ""}`}
          aria-label="Основна навигация"
        >
          {[
            ["#about", "За нас"],
            ["#courses", "Обучения"],
            ["#services", "Услуги"],
            ["#team", "Екип"],
            ["#gallery", "Галерия"],
            ["#contact", "Контакти"],
          ].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}

          <a href="#booking" className="navCta" onClick={() => setMenuOpen(false)}>
            Запиши се <span>↗</span>
          </a>
        </nav>
      </header>

      <section id="home" className="hero">
        <div className="heroCopy">
          <p className="eyebrow">
            <span className="statusDot" />
            BEAUTY. KNOWLEDGE. CONFIDENCE.
          </p>

          <h1>Красотата<br />започва с<br /><em>увереност.</em></h1>

          <p className="heroDescription">
            Твоята страст заслужава следваща стъпка.
            Превърни я в умение със Sarandev Academy.
          </p>

          <div className="heroActions">
            <a href="#courses" className="button darkButton">
              Открий обученията <span>↗</span>
            </a>
            <a href="#booking" className="textLink">Запази час ↗</a>
          </div>

          <div className="heroBottom">
            <span>ТВОЯТ НОВ ПЪТ ЗАПОЧВА ТУК</span>
            <a href="#about" className="scrollArrow" aria-label="Продължи надолу">
              ↓
            </a>
          </div>
        </div>

        <div className="portrait">
          <Photo
            src="/images/sofia.jpg"
            fallbacks={teamPhotoFallbacks(team[0])}
            alt="София Сарандева — основател на Sarandev Academy"
            className="portraitImage"
            eager
          />
          <div className="portraitShade" />
          <p className="portraitTop">THE WOMAN BEHIND THE ACADEMY</p>

          <div className="experienceBadge">
            <strong>7+</strong><span>ГОДИНИ<br />СТРАСТ И ОПИТ</span>
          </div>

          <div className="portraitCaption">
            <p>ОСНОВАТЕЛ & ПРЕПОДАВАТЕЛ</p>
            <h2>София Сарандева</h2>
            <button
              type="button"
              className="button lightButton"
              onClick={() => setModal("sofia")}
              aria-haspopup="dialog"
            >
              За София — прочети повече <span>↗</span>
            </button>
          </div>

          <span className="portraitSide">SARANDEV / ACADEMY</span>
        </div>
      </section>

      <div className="valuesBar">
        <span>ОБУЧЕНИЯ</span>
        <span>ПРАКТИКА</span>
        <span>КРАСОТА</span>
        <span>УВЕРЕНОСТ</span>
      </div>

      <section id="about" className="section about">
        <div>
          <p className="eyebrow">01 / НАШАТА ФИЛОСОФИЯ</p>
        </div>

        <div>
          <h2>Не просто курс.<br /><em>Твоето ново начало.</em></h2>

          <div className="aboutColumns">
            <p>
              Зад Sarandev Academy стои София Сарандева — професионалист
              с над 7 години опит, собственик на два салона за красота
              и преподавател, който вярва в потенциала на всеки курсист.
            </p>
            <div>
              <p>
                Учим чрез практика, внимание и споделен опит.
                За да си тръгнеш със знания, увереност и ясна посока
                за следващата си стъпка.
              </p>
              <button
                className="textLink"
                type="button"
                onClick={() => setModal("sofia")}
                aria-haspopup="dialog"
              >
                Запознай се със София ↗
              </button>
            </div>
          </div>

          <div className="stats">
            <div><strong>7+</strong><span>години опит</span></div>
            <div><strong>40+</strong><span>професионални обучения</span></div>
            <div><strong>2</strong><span>салона за красота</span></div>
          </div>
        </div>
      </section>

      <section className="materialsOffer" aria-labelledby="materials-title">
        <div className="materialsNumber">
          <span className="pill">ПРЕДИМСТВО ЗА НАШИТЕ КУРСИСТИ</span>
          <strong>−20<span>%</span></strong>
          <small>ЗА ПРОДУКТИ ЗА МАНИКЮР</small>
        </div>

        <div className="materialsCopy">
          <p className="eyebrow">ОБУЧЕНИЕТО Е САМО НАЧАЛОТО</p>
          <h2 id="materials-title">
            Нови умения.<br /><em>Още едно предимство.</em>
          </h2>
          <p>
            Запиши се и завърши успешно курс в
            <strong> Sarandev Academy</strong>, за да се възползваш
            след това от <strong>20% отстъпка при покупка на продукти
            за маникюр от VELOUR & THE BLACK BOTTLE.</strong>
          </p>

          <div className="materialsBrands" aria-label="VELOUR и THE BLACK BOTTLE">
            <span>VELOUR</span>
            <span className="materialsAmpersand">&</span>
            <span>THE BLACK BOTTLE</span>
          </div>

          <a href="#courses" className="button goldButton">
            Избери своето обучение <span>↗</span>
          </a>
        </div>
      </section>

      <section id="courses" className="section courses">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">02 / ОБУЧЕНИЯ</p>
            <h2>От страст<br /><em>към професия.</em></h2>
          </div>
          <p className="sectionIntro">
            Обучения със София Сарандева в Хасково и Пловдив.
            Избери своята посока.
          </p>
        </div>

        <div className="courseGrid">
          {courses.map((course, index) => (
            <article
              className={`courseCard ${course.id === "lashes" ? "darkCard" : ""}`}
              key={course.id}
            >
              <div className="cardTop">
                <span className="pill">{course.label}</span>
                <span>{String(index + 1).padStart(2, "0")} /</span>
              </div>

              <div className="coursePhoto">
                <Photo src={course.image} alt={course.imageAlt} />
              </div>

              <div className="courseBody">
                <p className="courseMeta">{course.meta}</p>
                <h3>{course.title}<br />{course.subtitle}</h3>
                <p className="courseDescription">{course.description}</p>

                <div className="tags">
                  {course.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>

                <div className="courseFooter">
                  <div className="price">
                    {course.price}<small>{course.priceNote}</small>
                  </div>
                  <button
                    type="button"
                    className="courseButton"
                    onClick={() => setModal(course.id)}
                    aria-haspopup="dialog"
                  >
                    Виж програмата <span>↗</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section process">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">ТВОЯТ ПЪТ В АКАДЕМИЯТА</p>
            <h2>Малки стъпки.<br /><em>Голяма промяна.</em></h2>
          </div>
          <span className="processSymbol" aria-hidden="true">↗</span>
        </div>

        <div className="processGrid">
          {[
            ["Разбираш.", "Започваме с теорията, материалите и правилната подготовка."],
            ["Практикуваш.", "Прилагаш наученото с демонстрации и насоки от преподавателя."],
            ["Надграждаш.", "Развиваш техниката, прецизността и увереността си."],
          ].map(([title, text], index) => (
            <article className="processCard" key={title}>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="statement">
        <p>Талантът е началото.<br /><em>Практиката прави разликата.</em></p>
        <small>SARANDEV ACADEMY</small>
      </section>

      <section id="services" className="section servicesSection">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">03 / УСЛУГИ</p>
            <h2>Красота.<br /><em>По твоя начин.</em></h2>
          </div>
          <p className="sectionIntro">
            Избери направление и разгледай услугите,
            създадени с внимание към теб.
          </p>
        </div>

        <div className="serviceGrid">
          {services.map((service, index) => (
            <button
              className={`serviceTile ${service.id === "service-3" ? "guestServiceTile" : ""}`}
              type="button"
              key={service.id}
              onClick={() => setModal(service.id)}
              aria-haspopup="dialog"
            >
              <span className="tileTop">
                <span>0{index + 1} / BEAUTY SERVICES</span>
                <span>↗</span>
              </span>

              <span className="servicePhoto">
                <Photo
                  src={service.image}
                  fallbacks={service.id === "service-3" ? gulselFallbacks : []}
                  alt={service.alt}
                />
              </span>

              <span className="tileTitle">{service.title}</span>
              <span className="tileDescription">{service.description}</span>
              <span className="tileBottom">
                Разгледай услугите <span aria-hidden="true">+</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <TeamSection onSofia={() => setModal("sofia")} />
      <GuestSection />

      <section id="gallery" className="section gallerySection">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">КРАСОТАТА В КАДЪР</p>
            <h2>Нашата работа.<br /><em>Истории в детайлите.</em></h2>
          </div>
          <p className="sectionIntro">
            Моменти от нашата работа, обучения и споделени успехи.
            Разгледай света на академията отблизо.
          </p>
        </div>

        <PhotoGallery photos={galleryPhotos} filters />
        <p className="galleryBottom">МАЛКИТЕ ДЕТАЙЛИ. ГОЛЯМОТО ВДЪХНОВЕНИЕ.</p>
      </section>

      <ReviewsSection />
      <BookingForm />

      <section id="contact" className="section contactSection">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">КОНТАКТИ</p>
            <h2>Нека се срещнем.<br /><em>Твоята стъпка е сега.</em></h2>
          </div>
          <a className="contactPhone" href={`tel:${academyTel}`}>
            <span>ЗА ОБУЧЕНИЯ И ИНФОРМАЦИЯ</span>
            {academyPhone} ↗
          </a>
        </div>

        <div className="locationGrid">
          {locations.map((location, index) => (
            <article className="locationCard" key={location.id}>
              <div className="locationTop">
                <span>0{index + 1} / НАШИЯТ САЛОН</span>
                <span>↗</span>
              </div>

              <h3>{location.city}<span>.</span></h3>
              <p>{location.address}</p>

              <div className="locationTeam">
                {team
                  .filter((member) => member.city === location.city)
                  .map((member) => (
                    <a
                      className="locationMember"
                      key={member.name}
                      href={`tel:${member.tel}`}
                      aria-label={`${member.name}, ${member.role}, телефон ${member.phone}`}
                    >
                      <span className="locationMemberPhoto">
                        <Photo
                          src={member.image}
                          fallbacks={teamPhotoFallbacks(member)}
                          alt={member.name}
                        />
                      </span>

                      <span className="locationMemberInfo">
                        <strong>{member.name}</strong>
                        <small>{member.role}</small>
                        <span className="locationMemberPhone">
                          {member.phone} <span aria-hidden="true">↗</span>
                        </span>
                      </span>

                      <span className="locationMemberArrow" aria-hidden="true">↗</span>
                    </a>
                  ))}
              </div>

              <a
                className="locationLink"
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.query)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Отвори адреса в Google Maps <span>↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="socialStrip">
          <div>
            <p className="eyebrow">ОСТАНИ В НАШИЯ СВЯТ</p>
            <p>Вдъхновение, обучения и красота — последвай ни.</p>
          </div>

          <div className="socialLinks">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Sarandev Academy в ${social.name} — отваря се в нов раздел`}
              >
                <span className="socialButtonIcon">
                  <SocialIcon name={social.id} />
                </span>
                <span className="socialButtonText">
                  <small>{social.label}</small>
                  <strong>{social.name}</strong>
                </span>
                <span className="socialButtonArrow" aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="closing">
        <span className="closingOutline" aria-hidden="true">ACADEMY</span>
        <div>
          <p className="eyebrow">НАПРАВИ СЛЕДВАЩАТА СТЪПКА</p>
          <h2>Твоят талант.<br /><em>Твоето бъдеще.</em></h2>
          <a href="#booking" className="button lightButton">
            Изпрати заявка <span>↗</span>
          </a>
        </div>
      </section>

      <footer className="footer">
        <a href="#home" className="brand">SARANDEV<span>ACADEMY</span></a>
        <p>Красота. Знания. Увереност.</p>
        <span>© 2026 Sarandev Academy</span>
        <a href="#home" className="backTop" aria-label="Към началото">↑</a>
      </footer>

      <Dialog
        open={modal !== null}
        onClose={() => setModal(null)}
        title={
          modal === "sofia"
            ? "София Сарандева"
            : selectedService?.title ??
              (selectedCourse
                ? `${selectedCourse.title} ${selectedCourse.subtitle}`
                : "Sarandev Academy")
        }
      >
        {modal === "sofia" && (
          <div className="modalCopy">
            <p className="eyebrow">ОСНОВАТЕЛ & ПРЕПОДАВАТЕЛ</p>
            <h2>София<br /><em>Сарандева.</em></h2>
            <p className="modalLead">
              Професионализъм, отдаденост и стремеж към съвършенство!
            </p>

            {biography.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

            <div className="infoBox">
              <h3>Обучения в Хасково и Пловдив</h3>
              <p>
                София провежда обученията в двата града.
                За информация и записване:
              </p>
              <a className="textLink" href={`tel:${academyTel}`}>
                {academyPhone} ↗
              </a>
            </div>

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към заявка за обучение <span>↗</span>
            </button>
          </div>
        )}

        {modal === "manicure" && (
          <div className="modalCopy">
            <p className="eyebrow">3 МОДУЛА / 5 ДНИ / 1 300 €</p>
            <h2>Базов курс<br /><em>„Маникюр“</em></h2>
            <p className="modalLead">Маникюр, педикюр и ноктопластика.</p>

            <h3>Теоретична подготовка</h3>
            <p>
              Стартираме с обширна теория, като въвеждаме курсиста в света
              на маникюра и разглеждаме материалите, инструментите и уредите.
              Включена е тема за болестите по ноктите. В края на курса се
              преминава през тест за проверка на знанията.
            </p>

            <h3>Практическа подготовка</h3>
            <ul>
              <li>Класически маникюр с гел лак</li>
              <li>Укрепване на ноктите</li>
              <li>Изравняване на нокътната плочка</li>
              <li>Различни техники за работа и руски маникюр</li>
              <li>Ноктопластика с хартиени и горни форми</li>
              <li>Частичен и спа педикюр</li>
              <li>Правилна работа с електрическа пила</li>
            </ul>

            <h3>Какво получавате след курса</h3>
            <p>
              Кратък урок за развитие в сферата на красотата и стратегии
              за работа, които да подкрепят първите ви професионални стъпки.
            </p>
            <p>
              Удостоверение, сертификат и Европас за работа в чужбина.
              Посоченият максимален срок за получаване на лицензирания документ
              е 30 дни след обучението във връзка с вписването в МОН.
            </p>

            <div className="infoBox">
              <h3>Продължителност и плащане</h3>
              <p><strong>Общо за трите модула: 1 300 €</strong></p>
              <p>Обучение: 5 дни според избраните модули.</p>
              <p>Продължителност: от 2 до 4 часа на ден.</p>
              <p>Капаро за запазване на дата: 300 €.</p>
              <p>Плащане на обучението — в първия ден на курса.</p>
              <p>Преподавател: София Сарандева.</p>
              <p>Градове: Хасково и Пловдив.</p>
            </div>

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към заявка за обучение <span>↗</span>
            </button>
          </div>
        )}

        {modal === "lashes" && (
          <div className="modalCopy">
            <p className="eyebrow">ПРОФЕСИОНАЛНО ОБУЧЕНИЕ</p>
            <h2>Ламиниране<br /><em>на мигли.</em></h2>
            <p className="modalLead">
              Овладей изкуството на естествено красивите,
              извити и подхранени мигли!
            </p>
            <p>
              Курсът съчетава теоретични знания и практическо обучение,
              за да ти даде увереност и умения за професионална работа.
            </p>

            <h3>Теоретична част</h3>
            <ul>{lashTheory.map((item) => <li key={item}>{item}</li>)}</ul>

            <h3>Практическа част</h3>
            <ul>{lashPractice.map((item) => <li key={item}>{item}</li>)}</ul>

            <h3>Допълнителни знания</h3>
            <ul>
              <li>Професионална консултация с клиент</li>
              <li>Определяне на цените на услугите</li>
              <li>Портфолио със снимки „преди и след“</li>
              <li>Привличане на клиенти и развитие на услугата</li>
            </ul>

            <h3>Защо да избереш Sarandev Academy?</h3>
            <p>
              Обучението е насочено към изграждане на реални практически
              умения, прецизност и увереност. Получаваш професионални знания,
              индивидуално внимание и съвети, базирани на опита на преподавателя.
            </p>

            <div className="infoBox">
              <h3>Продължителност и цена</h3>
              <p><strong>1 ден — 300 €</strong></p>
              <p><strong>2 дни — 450 €</strong></p>
              <p>Работа върху модел и фирмен сертификат.</p>
              <p>Преподавател: София Сарандева.</p>
              <p>Градове: Хасково и Пловдив.</p>
            </div>

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към заявка за обучение <span>↗</span>
            </button>
          </div>
        )}

        {modal === "lash-basic" && (
          <div className="modalCopy">
            <p className="eyebrow">4 ДНИ / 800 €</p>
            <h2>Базов курс<br /><em>по миглопластика.</em></h2>
            <p className="modalLead">
              Теоретична подготовка и практика върху модели
              със София Сарандева.
            </p>

            <h3>Ден 1 — теория и въведение</h3>
            <ul>
              <li>Обширна теория и въведение в миглопластиката</li>
              <li>Фази на растеж на миглите</li>
              <li>Подбор на материали</li>
              <li>Анализ на видовете очи</li>
              <li>Видове мигли — извивки, дебелини и дължини</li>
              <li>Изучаване на различни мапинги</li>
              <li>Тренировка върху кукла</li>
            </ul>

            <h3>Ден 2 — косъм по косъм</h3>
            <p>
              Практическа работа по техниката „Косъм по косъм“
              върху жив модел.
            </p>

            <h3>Ден 3 — обемни мигли</h3>
            <ul>
              <li>Практика върху модел с обемни мигли</li>
              <li>Тренировка за изработка на ръчни снопчета</li>
            </ul>

            <h3>Ден 4 — ламиниране на мигли</h3>
            <ul>
              <li>Теоретична подготовка за ламиниране на мигли</li>
              <li>Практика върху модел</li>
              <li>Финален тест за проверка на знанията</li>
            </ul>

            <h3>Организация и подкрепа</h3>
            <p>
              Всички материали по време на обучението са осигурени от нас.
              Обученията се провеждат индивидуално или в група до 3 курсистки.
              След обучението запазвате връзка с нас и получавате подкрепа.
            </p>

            <h3>След успешно завършване получавате</h3>
            <ul>
              <li>Лицензирано удостоверение от МОН</li>
              <li>Европас за работа в чужбина</li>
              <li>Фирмен сертификат</li>
            </ul>

            <div className="infoBox">
              <h3>Информация за обучението</h3>
              <p><strong>Цена: 800 €</strong></p>
              <p>Продължителност: 4 дни.</p>
              <p>Преподавател: София Сарандева.</p>
              <p>Провежда се в Хасково и Пловдив.</p>
            </div>

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към заявка за обучение <span>↗</span>
            </button>
          </div>
        )}

        {modal === "manicure-advanced" && (
          <div className="modalCopy">
            <p className="eyebrow">НАДГРАЖДАЩО ОБУЧЕНИЕ / 2 ДНИ / 500 €</p>
            <h2>Надграждащо обучение<br /><em>по маникюр.</em></h2>
            <p className="modalLead">
              Развий техниката, прецизността и професионалния си подход
              със София Сарандева.
            </p>

            <h3>Пилене и оформяне</h3>
            <ul>
              <li>Три техники на пилене</li>
              <li>Оформяне на бадем, квадрат и овал при къси нокти</li>
              <li>
                Изграждане с хартиени форми и правилното им поставяне
                според избраната от клиента форма
              </li>
            </ul>

            <h3>Комбиниран маникюр</h3>
            <ul>
              <li>Работа с електрическа пила</li>
              <li>Премахване на кожички с различни видове фрези</li>
              <li>Насечки на накрайниците и обороти за работа във всяка зона</li>
              <li>Практически техники за омекотяване на кутикулата</li>
            </ul>

            <h3>Гел лак и прецизно лакиране</h3>
            <ul>
              <li>Гел лак с изравняване</li>
              <li>Прецизно лакиране под кутикулата</li>
              <li>
                Видове бази и правилен подбор според нокътната плочка
                на клиента
              </li>
            </ul>

            <h3>Личностно и професионално развитие</h3>
            <ul>
              <li>Развитие на социалните мрежи и профила в Instagram</li>
              <li>Подход и общуване с клиентите</li>
              <li>Изграждане на професионално присъствие</li>
            </ul>

            <h3>След успешно завършване</h3>
            <p>Получавате фирмен сертификат.</p>

            <div className="infoBox">
              <h3>Информация за обучението</h3>
              <p><strong>Цена: 500 €</strong></p>
              <p>Продължителност: 2 дни.</p>
              <p>Преподавател: София Сарандева.</p>
              <p>Провежда се в Хасково и Пловдив.</p>
            </div>

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към заявка за обучение <span>↗</span>
            </button>
          </div>
        )}

        {selectedService && (
          <div className="modalCopy">
            <p className="eyebrow">SARANDEV ACADEMY / УСЛУГИ</p>
            <h2>{selectedService.title}</h2>
            <p className="modalLead">{selectedService.description}</p>

            <ul className="serviceModalList">
              {selectedService.items.map((item, index) => (
                <li key={item}>
                  <small>{String(index + 1).padStart(2, "0")}</small>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {selectedService.id === "service-3" && (
              <>
                <div className="modalGuestPhoto">
                  <Photo
                    src={gulselPhoto}
                    fallbacks={gulselFallbacks}
                    alt="Гюнюл Мерт"
                  />
                </div>
                <div className="infoBox">
                  <h3>Гюнюл Мерт</h3>
                  <p>Гостува всеки месец от Турция в Хасково и Пловдив.</p>
                  <p>Филър, с който работи: <strong>Elasty</strong>.</p>
                  <p>Датите се уточняват предварително при записване.</p>
                </div>
              </>
            )}

            {(selectedService.id === "service-0" ||
              selectedService.id === "service-1") && (
              <div className="modalSpecialists">
                <h3>Специалисти</h3>

                {team
                  .filter((member) =>
                    selectedService.id === "service-0"
                      ? member.role === "Маникюрист"
                      : member.role === "Миглостилист"
                  )
                  .map((member) => (
                    <a
                      className="modalMember"
                      key={member.name}
                      href={`tel:${member.tel}`}
                    >
                      <span className="modalMemberPhoto">
                        <Photo
                          src={member.image}
                          fallbacks={teamPhotoFallbacks(member)}
                          alt={member.name}
                        />
                      </span>
                      <span className="modalMemberInfo">
                        <strong>{member.name}</strong>
                        <small>{member.city}</small>
                        <span>{member.phone} ↗</span>
                      </span>
                    </a>
                  ))}
              </div>
            )}

            <button
              className="button darkButton modalCta"
              type="button"
              onClick={openBooking}
            >
              Към записване <span>↗</span>
            </button>
          </div>
        )}
      </Dialog>
    </main>
  );
}

/* ================= СТИЛОВЕ ================= */

const styles = `
html{scroll-behavior:smooth;scroll-padding-top:105px}
body{margin:0}
.academy{--ink:#151515;--gold:#c7a66d;--paper:#faf9f6;background:var(--paper);color:var(--ink);font-family:Arial,Helvetica,sans-serif;overflow-x:clip}
.academy *,.academy *::before,.academy *::after{box-sizing:border-box}
.academy h1,.academy h2,.academy h3,.academy p{margin:0}
.academy a{color:inherit;text-decoration:none}
.academy button,.academy input,.academy select,.academy textarea{font:inherit}
.academy button{cursor:pointer}
.academy button:disabled{cursor:wait}
.academy button:focus-visible,.academy a:focus-visible{outline:3px solid var(--gold);outline-offset:5px}
.academy em{font-family:Georgia,"Times New Roman",serif;font-weight:400}
.academy h2{font-size:clamp(35px,4.2vw,65px);line-height:1.12;letter-spacing:-2.2px;font-weight:600}
.section{padding:100px 6%;scroll-margin-top:20px}
.sectionHeading{display:flex;justify-content:space-between;align-items:flex-end;gap:35px;margin-bottom:45px}
.sectionIntro{max-width:310px;font-size:14px;line-height:1.9;color:#777}
.eyebrow{display:flex;align-items:center;gap:10px;margin-bottom:23px!important;font-size:9px;font-weight:700;letter-spacing:2px;line-height:1.8}
.button{display:inline-flex;justify-content:space-between;align-items:center;gap:30px;padding:20px 25px;border:1px solid transparent;font-size:12px;font-weight:700;line-height:1.4;transition:transform .25s,background .25s}
.button:hover{transform:translateY(-3px)}
.button>span{font-size:23px;font-weight:400}
.darkButton{background:#151515;color:#fff!important}
.lightButton{background:#fff;color:#151515!important}
.goldButton{background:#c7a66d;color:#151515!important}
.textLink{display:inline-block;padding:8px 0;background:none;border:0;border-bottom:1px solid currentColor;font-size:12px!important;font-weight:600;color:inherit}
.pill{display:inline-block;padding:9px 12px;border:1px solid currentColor;border-radius:30px;font-size:8px;letter-spacing:1px;line-height:1.5}
.photoFallback{display:flex;min-height:220px;align-items:center;justify-content:center;flex-direction:column;background:#242424;color:#c7a66d;padding:30px;text-align:center}
.photoFallback small{max-width:220px;font-size:12px;line-height:1.8}

/* НАВИГАЦИЯ */
.header{position:sticky;top:0;z-index:50;display:flex;align-items:center;justify-content:space-between;gap:30px;min-height:94px;padding:19px 5%;background:#faf9f6f5;backdrop-filter:blur(18px);border-bottom:1px solid #15151512}
.brand{display:inline-flex;flex-direction:column;flex-shrink:0;font-size:27px;font-weight:800;letter-spacing:-1px;line-height:1}
.brand span{margin-top:8px;padding-left:2px;font-size:9px;font-weight:400;letter-spacing:6px}
.navigation{display:flex;align-items:center;gap:23px}
.navigation>a{font-size:11px}
.navigation>a:not(.navCta):hover{color:#94702e}
.navigation .navCta{display:flex;align-items:center;gap:26px;padding:15px 18px;border:1px solid #151515}
.navCta span{font-size:20px}
.menuToggle{display:none}

/* HERO */
.hero{display:grid;grid-template-columns:1fr 1fr}
.heroCopy{display:flex;flex-direction:column;padding:55px 10% 25px 12%;min-height:760px}
.statusDot{width:7px;height:7px;border-radius:50%;background:#c7a66d;box-shadow:0 0 0 5px #c7a66d18;flex-shrink:0}
.hero h1{margin-top:22px;font-size:clamp(62px,6.9vw,108px);font-weight:500;letter-spacing:-5px;line-height:.99}
.hero h1 em{color:#947647}
.heroDescription{max-width:310px;margin-top:32px!important;color:#777;font-size:14px;line-height:1.9}
.heroActions{display:flex;align-items:center;flex-wrap:wrap;gap:25px;margin-top:33px}
.heroBottom{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-top:auto;padding-top:50px}
.heroBottom>span{font-size:8px;letter-spacing:1.5px;color:#888}
.scrollArrow{display:grid;place-items:center;width:42px;height:42px;border:1px solid #ccc;border-radius:50%;font-size:22px;animation:bounce 2.5s infinite}
.portrait{position:relative;min-height:760px;overflow:hidden;background:#242424;color:#fff}
.portraitImage{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center 28%}
.portraitShade{position:absolute;inset:0;background:linear-gradient(180deg,#0003,transparent 35%,#000b);pointer-events:none}
.portraitTop{position:absolute;top:35px;left:35px;font-size:8px;letter-spacing:2px}
.experienceBadge{position:absolute;right:35px;top:90px;display:flex;flex-direction:column;align-items:center;justify-content:center;width:112px;height:112px;border:1px solid #d6bc91;border-radius:50%;background:#15151535;color:#ecd8b4;backdrop-filter:blur(5px);transform:rotate(9deg)}
.experienceBadge strong{font:42px/1 Georgia,serif}
.experienceBadge span{margin-top:8px;font-size:7px;line-height:1.6;letter-spacing:1px;text-align:center}
.portraitCaption{position:absolute;bottom:45px;left:40px;right:40px}
.portraitCaption>p{margin-bottom:15px;font-size:9px;letter-spacing:2px;color:#e0cca9}
.portraitCaption h2{margin-bottom:25px;font:44px/1.1 Georgia,serif;letter-spacing:-1px}
.portraitSide{position:absolute;right:17px;top:50%;writing-mode:vertical-rl;font-size:8px;letter-spacing:3px}
.valuesBar{display:flex;justify-content:center;align-items:center;gap:50px;padding:27px 5%;border-bottom:1px solid #ddd;background:#f1eee7}
.valuesBar span{font-size:10px;letter-spacing:2px}

/* ЗА НАС */
.about{display:grid;grid-template-columns:.35fr 1fr;gap:65px}
.aboutColumns{display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-top:32px}
.aboutColumns p{color:#777;font-size:14px;line-height:1.95}
.aboutColumns .textLink{margin-top:20px}
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:45px;padding-top:27px;border-top:1px solid #ddd}
.stats strong{display:block;font:58px/1.1 Georgia,serif}
.stats span{display:block;margin-top:10px;font-size:11px;color:#777}

/* ОТСТЪПКА */
.materialsOffer{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:center;position:relative;padding:70px 8%;overflow:hidden;background:radial-gradient(ellipse at 10% 50%,#c7a66d20,transparent 60%),#151515;color:#fff}
.materialsNumber{display:flex;align-items:center;flex-direction:column;color:#d6b985}
.materialsNumber .pill{font-size:8px}
.materialsNumber>strong{font-size:clamp(100px,14vw,210px);font-weight:500;line-height:1.1;letter-spacing:-10px}
.materialsNumber>strong>span{font:65px Georgia,serif;letter-spacing:-4px}
.materialsNumber>small{font-size:9px;letter-spacing:2.5px;text-align:center;line-height:1.8}
.materialsCopy .eyebrow{color:#c7a66d}
.materialsCopy h2{font-size:clamp(32px,3.5vw,52px)}
.materialsCopy>p:not(.eyebrow){max-width:520px;margin-top:25px;font-size:15px;line-height:1.9;color:#bbb}
.materialsCopy strong{font-weight:500;color:#fff}
.materialsCopy .button{margin-top:28px}
.materialsBrands{display:flex;align-items:center;flex-wrap:wrap;gap:16px;margin-top:25px;padding:22px 0;border-top:1px solid #c7a66d35;border-bottom:1px solid #c7a66d35;color:#dec69d}
.materialsBrands>span:not(.materialsAmpersand){font-size:clamp(14px,1.6vw,22px);font-weight:600;letter-spacing:2px;line-height:1.5}
.materialsBrands .materialsAmpersand{font:italic 28px Georgia,serif;color:#a78b5b}

/* ОБУЧЕНИЯ */
.courses{background:#f3f1ec}
.courseGrid{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:stretch}
.courseCard{display:flex;flex-direction:column;min-width:0;border:1px solid #d6d2ca;background:#faf9f6;overflow:hidden}
.darkCard{background:#191919;color:#fff;border-color:#191919}
.cardTop{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:25px}
.cardTop>span:last-child{font-size:10px;opacity:.55;white-space:nowrap}
.coursePhoto{position:relative;display:flex;align-items:center;justify-content:center;aspect-ratio:3/2;margin:0 25px;overflow:hidden;background:#e8e1d6;flex-shrink:0}
.coursePhoto>img,.coursePhoto>.photoFallback{display:block;width:100%;height:100%;min-height:0;object-fit:contain}
.coursePhoto>.photoFallback{display:flex}
.courseBody{display:flex;flex-direction:column;flex:1;padding:25px 30px 30px}
.courseMeta{margin-bottom:18px!important;font-size:9px;letter-spacing:1.5px;color:#9b7c4e;line-height:1.8}
.courseBody h3{font-size:42px;line-height:1.1;letter-spacing:-1.6px;font-weight:500;overflow-wrap:break-word}
.courseDescription{max-width:390px;min-height:75px;margin-top:22px!important;font-size:13px;line-height:1.85;opacity:.65}
.tags{display:flex;flex-wrap:wrap;gap:7px;margin-top:23px;margin-bottom:30px}
.tags span{border:1px solid #8885;padding:8px 11px;border-radius:25px;font-size:9px;line-height:1.6}
.courseFooter{display:flex;justify-content:space-between;align-items:flex-end;gap:20px;margin-top:auto;padding-top:25px;border-top:1px solid #8885}
.price{font-size:32px;letter-spacing:-1px}
.price small{display:block;margin-top:8px;font-size:10px;letter-spacing:0;opacity:.6;line-height:1.7}
.courseButton{padding:10px 0;border:0;border-bottom:1px solid currentColor;color:inherit;background:transparent;font-size:11px!important;flex-shrink:0}
.courseButton span{padding-left:12px;font-size:22px}

/* ПРОЦЕС */
.processSymbol{font-size:95px;color:#b3925e;line-height:.8}
.processGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:45px}
.processCard{padding-top:25px;border-top:1px solid #bbb}
.processCard>span{font-size:11px;color:#a18454}
.processCard h3{margin-top:30px;font-size:28px;font-weight:500}
.processCard p{margin-top:17px;font-size:13px;color:#777;line-height:1.9;max-width:290px}
.statement{display:flex;align-items:center;justify-content:space-between;gap:35px;padding:50px 6%;background:#e9e2d5}
.statement p{flex:1;font-size:clamp(24px,3vw,43px);line-height:1.3;letter-spacing:-1px}
.statement small{writing-mode:vertical-rl;font-size:8px;letter-spacing:2px}

/* УСЛУГИ */
.serviceGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:25px;align-items:stretch}
.serviceTile{display:flex;flex-direction:column;min-width:0;height:100%;border:1px solid #d9d5cc;background:#fff;padding:25px;color:#151515;text-align:left;transition:transform .3s,border-color .3s}
.serviceTile:hover{transform:translateY(-6px);border-color:#b2915d}
.tileTop{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:20px;font-size:8px;letter-spacing:1px}
.tileTop>span:last-child{font-size:26px;color:#a18454}
.servicePhoto{display:flex;align-items:center;justify-content:center;width:100%;height:clamp(240px,25vw,380px);min-height:0;aspect-ratio:auto;flex-shrink:0;overflow:hidden;background:#eee}
.servicePhoto>img,.servicePhoto>.photoFallback{display:block;width:100%;height:100%;min-height:0;max-height:none;object-fit:cover;transition:transform .6s}
.servicePhoto>.photoFallback{display:flex}
.serviceTile:hover .servicePhoto img{transform:scale(1.04)}
.tileTitle{margin-top:25px;font-size:31px;font-weight:500;letter-spacing:-1px;line-height:1.2}
.tileDescription{flex-grow:1;margin-top:12px;color:#777;font-size:13px;line-height:1.8}
.tileBottom{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-top:25px;padding-top:20px;border-top:1px solid #ddd;width:100%;font-size:11px;flex-shrink:0}
.tileBottom>span{font-size:26px}
.guestServiceTile .servicePhoto{background:#eeeae3}
.guestServiceTile .servicePhoto>img{object-fit:contain;object-position:center;transform:none!important}

/* ЕКИП */
.teamSection{background:#eeeae3}
.filterButtons{display:flex;flex-wrap:wrap;gap:9px}
.filterButtons button{padding:11px 20px;border-radius:30px;border:1px solid #9997;background:transparent;color:inherit;font-size:11px;transition:background .2s,color .2s}
.filterButtons button[aria-pressed="true"]{background:#c7a66d;border-color:#c7a66d;color:#151515}
.teamFilters{margin-bottom:32px}
.teamGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px}
.teamCard{display:flex;flex-direction:column;background:#faf9f6;min-width:0;border:1px solid #d5cfc3}
.teamPhoto{position:relative;aspect-ratio:4/5;overflow:hidden;background:#e5dfd5}
.teamPhoto>img,.teamPhoto>.photoFallback{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
.teamPhoto>.photoFallback{display:flex}
.cityBadge{position:absolute;bottom:17px;left:17px;padding:9px 13px;background:#faf9f6ee;color:#151515;font-size:10px;backdrop-filter:blur(8px)}
.teamBody{display:flex;flex-direction:column;flex:1;padding:25px}
.teamRole{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#9b7a47;margin-bottom:13px!important}
.teamBody h3{font:28px/1.15 Georgia,serif}
.teamDescription{margin-top:17px!important;color:#777;font-size:12px;line-height:1.85}
.teamPhone{display:flex;justify-content:space-between;gap:12px;padding-top:21px;margin-top:auto;font-size:14px}
.teamPhone>span{font-size:20px;color:#9b7a47}
.teamBody .textLink{align-self:flex-start;margin-top:15px}

/* ГОСТУВАЩ СПЕЦИАЛИСТ */
.guestSection{padding:90px 6%;background:#151515;color:#fff}
.guestIntro{display:grid;grid-template-columns:.85fr 1.15fr;gap:70px;align-items:center}
.guestPortrait{position:relative;background:#242424;overflow:hidden;display:flex;align-items:center;justify-content:center}
.guestPortrait>img{display:block;width:100%;height:auto;max-height:780px;object-fit:contain;object-position:center}
.guestPortrait>.photoFallback{width:100%;min-height:500px}
.guestPortraitLabel{position:absolute;bottom:22px;left:22px;padding:12px 15px;border:1px solid #ffffff60;background:#15151580;font-size:9px;letter-spacing:2px}
.guestCopy .eyebrow{color:#c7a66d}
.guestCopy h2{font-size:clamp(35px,4vw,58px)}
.guestDescription{max-width:440px;margin-top:25px!important;color:#bbb;font-size:14px;line-height:1.9}
.guestCities{display:flex;gap:9px;margin-top:20px}
.guestCities span{padding:9px 14px;border:1px solid #ffffff40;font-size:10px}
.guestServices{display:flex;flex-wrap:wrap;gap:9px;margin-top:28px}
.guestServices>span{padding:10px 14px;border:1px solid #c7a66d55;border-radius:25px;font-size:12px;color:#dfc89f}
.productNote{display:flex;align-items:center;gap:25px;margin-top:30px;padding:22px 0;border-top:1px solid #ffffff25;border-bottom:1px solid #ffffff25}
.productNote>span{max-width:130px;font-size:8px;letter-spacing:1.5px;line-height:1.8;color:#aaa}
.productNote strong{font:italic 42px/1 Georgia,serif;color:#d6b985}
.guestNote{margin-top:22px!important;color:#999;font-size:11px;line-height:1.9}
.guestCopy .button{margin-top:25px}
.guestPortfolio{margin-top:80px;padding-top:45px;border-top:1px solid #ffffff25}
.guestPortfolio .sectionHeading h3{font-size:42px;line-height:1.12;font-weight:500;letter-spacing:-1px}
.guestPortfolio .eyebrow{color:#c7a66d}
.guestPortfolio .sectionIntro{color:#aaa}

/* ГАЛЕРИЯ */
.gallerySection{background:#1d1d1d;color:#fff}
.gallerySection .eyebrow{color:#c7a66d}
.gallerySection .sectionIntro{color:#aaa}
.galleryToolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:23px 0;margin-bottom:18px;border-top:1px solid #ffffff25}
.galleryCount{font-size:9px;letter-spacing:2px;color:#aaa;white-space:nowrap}
.galleryGrid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:20px}
.galleryCard{display:block;position:relative;padding:0;border:0;background:#333;overflow:hidden;aspect-ratio:4/5;color:#fff;text-align:left;isolation:isolate}
.galleryCard>img,.galleryCard>.photoFallback{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s}
.galleryCard>.photoFallback{display:flex}
.galleryCard:hover>img{transform:scale(1.06)}
.galleryShade{position:absolute;inset:0;background:linear-gradient(transparent 35%,#000c)}
.galleryNumber{position:absolute;left:18px;top:20px;font-size:10px;letter-spacing:1px;text-shadow:0 1px 8px #000}
.galleryExpand{position:absolute;right:15px;top:15px;display:grid;place-items:center;width:34px;height:34px;border:1px solid #ffffff80;border-radius:50%;background:#0002;font-size:21px}
.galleryCaption{position:absolute;bottom:23px;left:20px;right:20px;display:flex;flex-direction:column}
.galleryCaption small{margin-bottom:10px;font-size:8px;text-transform:uppercase;letter-spacing:1.8px;color:#e1c9a0}
.galleryCaption strong{font:25px/1.15 Georgia,serif}
.galleryCaption>span{margin-top:13px;font-size:9px;opacity:0;transform:translateY(7px);transition:opacity .3s,transform .3s}
.galleryCard:hover .galleryCaption>span,.galleryCard:focus-visible .galleryCaption>span{opacity:1;transform:none}
.galleryBottom{margin-top:35px!important;text-align:center;font-size:8px;letter-spacing:2px;color:#999}
.compactGallery .galleryGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
.compactGallery .galleryCard{aspect-ratio:1/1}
.compactGallery .galleryCaption strong{font-size:21px}

/* ОТЗИВИ И ФОРМИ */
.reviewsSection{background:#f2eee6}
.reviewsNotice{font-size:14px;line-height:1.9;color:#777}
.reviewsGrid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-bottom:40px}
.reviewCard{display:flex;flex-direction:column;min-width:0;padding:30px;border:1px solid #dcd4c5;background:#faf9f6}
.reviewRating{font-size:14px;font-weight:700;color:#94702e;line-height:1.8}
.reviewText{margin-top:22px!important;margin-bottom:25px!important;color:#666;font-size:14px;line-height:1.9;white-space:pre-wrap;overflow-wrap:anywhere}
.reviewCard h3{margin-top:auto;border-top:1px solid #ddd;padding-top:20px;font-size:14px;overflow-wrap:anywhere}
.reviewFormLayout{margin-top:40px}
.bookingSection{background:#efefed}
.formLayout{display:grid;grid-template-columns:.8fr 1.2fr;border:1px solid #d6d1c6;background:#fff}
.formAside{padding:45px;background:#151515;color:#fff}
.formAside>.eyebrow{color:#c7a66d}
.formAside h3{font-size:34px;line-height:1.2;letter-spacing:-1px;font-weight:500}
.formAside>p:not(.eyebrow){margin-top:25px;font-size:13px;line-height:1.9;color:#bbb}
.formAside ol{margin-top:30px;padding-left:20px;font-size:13px;color:#bbb;line-height:1.9}
.formAside li{padding-left:5px;margin-bottom:12px}
.bookingNotice{margin-top:30px;padding-top:25px;border-top:1px solid #ffffff30}
.bookingNotice strong{font-size:13px}
.bookingNotice p{margin-top:13px;color:#aaa;font-size:12px;line-height:1.9}
.asidePhone{display:inline-block;margin-top:30px;padding-bottom:8px;border-bottom:1px solid #c7a66d80;color:#d6b985!important;font-size:17px}
.saForm{padding:40px;min-width:0}
.saForm fieldset{border:0;padding:0;margin:0;min-width:0}
.saForm fieldset:disabled{opacity:.65}
.saForm legend{padding:0;margin-bottom:24px;font-size:9px;letter-spacing:2px}
.formFields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 18px}
.fullWidth{grid-column:1/-1}
.saForm label{display:flex;flex-direction:column;gap:10px;min-width:0}
.saForm label>span{font-size:12px;font-weight:700}
.saForm input,.saForm select,.saForm textarea{display:block;width:100%;min-width:0;border:1px solid #ccc;border-radius:0;background:#fff;color:#151515;padding:14px 12px;font-size:14px}
.saForm textarea{resize:vertical}
.saForm input:focus,.saForm select:focus,.saForm textarea:focus{outline:2px solid #c7a66d;outline-offset:1px;border-color:#c7a66d}
.bookingTypeButtons{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:28px}
.bookingTypeButtons button{display:flex;justify-content:space-between;align-items:center;gap:15px;background:#fff;border:1px solid #ccc;padding:17px;color:#151515;font-size:13px}
.bookingTypeButtons button[aria-pressed="true"]{background:#151515;border-color:#151515;color:#fff}
.formInfo{padding:16px;background:#f2eee6;color:#655536;font-size:12px;line-height:1.8}
.formHint{font-size:11px;line-height:1.8;color:#777}
.formPrivacy{margin-top:22px!important;color:#777;font-size:11px;line-height:1.8}
.formSubmit{display:flex;justify-content:space-between;align-items:center;width:100%;gap:20px;margin-top:20px;padding:19px 22px;border:0;background:#151515;color:#fff;font-size:13px!important;font-weight:700!important}
.formSubmit>span{font-size:23px;color:#d6b985}
.formMessage{margin-top:20px!important;padding:18px;font-size:13px;line-height:1.8}
.errorMessage{background:#fff0f0;color:#a32323;border:1px solid #efcaca}
.successMessage{background:#edf6ee;color:#23512c;border:1px solid #c6dfca}

/* КОНТАКТИ */
.contactPhone{font-size:clamp(22px,2.7vw,38px);letter-spacing:-1px;white-space:nowrap}
.contactPhone>span{display:block;margin-bottom:13px;font-size:8px;color:#888;letter-spacing:1.5px}
.locationGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:25px}
.locationCard{background:#f0ede7;border:1px solid #ddd6c9;padding:35px;min-width:0}
.locationTop{display:flex;justify-content:space-between;align-items:center;gap:15px;font-size:9px;letter-spacing:1.5px}
.locationTop>span:last-child{font-size:28px;color:#a18454}
.locationCard h3{margin-top:32px;font-size:clamp(38px,4vw,60px);letter-spacing:-2px;font-weight:500}
.locationCard h3>span{color:#a18454}
.locationCard>p{margin-top:15px;font-size:15px;line-height:1.7;color:#777}
.locationTeam{margin-top:30px}
.locationMember{display:grid;grid-template-columns:100px minmax(0,1fr) 24px;align-items:center;gap:20px;padding:22px 0;border-top:1px solid #d4ccbe}
.locationMemberPhoto{display:block;width:100px;height:125px;background:#e1dace;overflow:hidden;border:1px solid #d4c7b0}
.locationMemberPhoto>img{display:block;width:100%;height:100%;object-fit:contain;object-position:center}
.locationMemberPhoto>.photoFallback{width:100%;height:100%;min-height:0;padding:8px}
.locationMemberPhoto .photoFallback small{font-size:8px;line-height:1.4}
.locationMemberInfo{display:flex;flex-direction:column;gap:9px;min-width:0}
.locationMemberInfo>strong{font-size:16px;font-weight:500;line-height:1.4}
.locationMemberInfo>small{font-size:11px;color:#888}
.locationMemberPhone{font-size:13px;line-height:1.6;color:#896d42}
.locationMemberArrow{font-size:24px;color:#a18454}
.locationMember:hover .locationMemberInfo>strong{color:#937444}
.locationLink{display:flex;justify-content:space-between;align-items:center;gap:20px;padding-top:20px;margin-top:20px;border-top:1px solid #c9c0b0;font-size:12px}
.locationLink span{font-size:23px}

/* СОЦИАЛНИ МРЕЖИ */
.socialStrip{display:block;padding-top:40px;margin-top:45px;border-top:1px solid #ddd}
.socialStrip>div:first-child{margin-bottom:25px}
.socialStrip .eyebrow{margin-bottom:10px!important}
.socialStrip p:not(.eyebrow){color:#777;font-size:13px;line-height:1.8}
.socialLinks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}
.socialLinks>a{display:flex;align-items:center;justify-content:flex-start;gap:18px;min-width:0;min-height:110px;padding:24px;border:1px solid #c7a66d;background:#151515;color:#fff;box-shadow:0 8px 24px #15151512;transition:background .25s,color .25s,transform .25s}
.socialButtonIcon{display:grid;place-items:center;flex-shrink:0;width:48px;height:48px;border:1px solid #c7a66d70;border-radius:50%;color:#d8bc8d}
.socialButtonIcon svg{display:block;width:25px;height:25px}
.socialButtonText{display:flex;flex-direction:column;gap:9px;min-width:0}
.socialButtonText small{font-size:8px;line-height:1.6;letter-spacing:1.3px;color:#d8bc8d}
.socialButtonText strong{font-size:22px;font-weight:500;letter-spacing:-.5px}
.socialButtonArrow{margin-left:auto;color:#d8bc8d;font-size:28px}
.socialLinks>a:hover{background:#c7a66d;color:#151515;transform:translateY(-4px)}
.socialLinks>a:hover .socialButtonIcon,.socialLinks>a:hover .socialButtonText small,.socialLinks>a:hover .socialButtonArrow{color:#151515}
.socialLinks>a:hover .socialButtonIcon{border-color:#15151550}

/* ФИНАЛ */
.closing{position:relative;padding:100px 6%;background:#151515;color:#fff;text-align:center;overflow:hidden}
.closingOutline{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-8deg);font-size:22vw;letter-spacing:-1vw;font-weight:900;color:transparent;-webkit-text-stroke:1px #ffffff15;pointer-events:none}
.closing>div{position:relative}
.closing .eyebrow{justify-content:center;color:#c7a66d}
.closing h2{font-size:clamp(45px,6.5vw,90px)}
.closing .button{margin-top:35px}
.footer{display:flex;justify-content:space-between;align-items:center;gap:25px;padding:35px 5%}
.footer .brand{font-size:21px}
.footer .brand span{font-size:8px;letter-spacing:5px}
.footer p,.footer>span{font-size:11px;color:#777}
.backTop{width:42px;height:42px;border:1px solid #ccc;display:grid;place-items:center;font-size:22px}

/* ПРОЗОРЦИ */
.saDialog{width:min(800px,calc(100vw - 28px));max-width:none;max-height:92dvh;padding:0;border:1px solid #d0c3ac;margin:auto;background:#faf9f6;color:#151515;overflow:auto}
.saDialog::backdrop{background:#000d;backdrop-filter:blur(7px)}
.saDialog[open]{animation:enter .25s ease}
.saDialogWide{width:min(1120px,calc(100vw - 28px));background:#111;color:#fff}
.dialogBar{position:sticky;top:0;z-index:2;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:15px 25px;border-bottom:1px solid #8884;background:#faf9f6}
.saDialogWide .dialogBar{background:#111}
.dialogBar>span{font-size:11px}
.dialogBar button{display:flex;align-items:center;gap:12px;border:1px solid #8885;background:transparent;color:inherit;padding:8px 12px;font-size:11px;white-space:nowrap}
.dialogBar button>span{font-size:22px;line-height:1}
.dialogBody{padding:35px 40px 40px}
.saDialogWide .dialogBody{padding:0}
.modalCopy h2{margin-top:12px;font-size:clamp(35px,5vw,57px);overflow-wrap:break-word}
.modalCopy p:not(.eyebrow){margin-top:20px;color:#666;font-size:14px;line-height:1.95}
.modalCopy .modalLead{color:#151515!important;font-size:20px!important}
.modalCopy h3{margin-top:30px;font-size:21px;font-weight:500}
.modalCopy ul{padding-left:22px;color:#666;font-size:14px;line-height:1.85}
.modalCopy li{margin-top:9px}
.infoBox{margin-top:30px;padding:25px;background:#eee8dc}
.infoBox h3{margin-top:0}
.infoBox p{margin-top:12px!important}
.infoBox .textLink{margin-top:15px}
.modalCta{margin-top:30px}
.modalCopy .serviceModalList{padding:0;margin:30px 0 0;list-style:none;border-top:1px solid #ccc}
.serviceModalList li{display:grid;grid-template-columns:25px 1fr;align-items:center;gap:15px;margin:0;padding:20px 0;border-bottom:1px solid #ddd;color:#151515;font-size:18px}
.serviceModalList small{font-size:10px;color:#999}
.modalSpecialists{margin-top:30px}
.modalMember{display:flex;align-items:center;gap:20px;padding:20px 0;border-bottom:1px solid #ddd}
.modalMemberPhoto{display:block;width:85px;height:105px;flex-shrink:0;background:#e7e0d4}
.modalMemberPhoto>img{display:block;width:100%;height:100%;object-fit:contain}
.modalMemberPhoto>.photoFallback{width:100%;height:100%;min-height:0;padding:8px}
.modalMemberPhoto .photoFallback small{font-size:8px}
.modalMemberInfo{display:flex;flex-direction:column;gap:8px}
.modalMemberInfo>strong{font-size:15px;font-weight:500}
.modalMemberInfo>small{font-size:10px;color:#888}
.modalMemberInfo>span{font-size:13px;color:#937444}
.modalGuestPhoto{margin-top:30px;background:#e8e1d6}
.modalGuestPhoto>img{display:block;width:100%;height:auto;max-height:600px;object-fit:contain}
.galleryViewer{position:relative;background:#090909;outline-offset:-3px;touch-action:pan-y}
.galleryViewer>img,.galleryViewer>.photoFallback{display:block;width:100%;height:min(70dvh,760px);min-height:200px;object-fit:contain}
.galleryViewer>.photoFallback{display:flex}
.galleryViewer>button{position:absolute;top:calc(50% - 25px);width:45px;height:45px;border:1px solid #ffffff80;border-radius:50%;background:#151515b0;color:#fff;font-size:25px}
.viewerPrevious{left:15px}
.viewerNext{right:15px}
.viewerCaption{display:flex;justify-content:space-between;gap:20px;padding:20px 25px;font-size:12px;line-height:1.7;background:#111;color:#ddd}

@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(6px)}}
@keyframes enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

/* ТАБЛЕТ */
@media(max-width:1100px){
.navigation{gap:15px}
.heroCopy{padding-left:10%;padding-right:8%}
.hero h1{font-size:78px}
.heroCopy,.portrait{min-height:700px}
.heroActions{gap:18px}
.about{grid-template-columns:.25fr 1fr;gap:40px}
.galleryGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
.teamGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
.guestIntro{gap:40px}
.formAside{padding:35px}
.saForm{padding:30px}
.locationMember{grid-template-columns:80px minmax(0,1fr);gap:15px}
.locationMemberPhoto{width:80px;height:105px}
.locationMemberArrow{display:none}
}

@media(max-width:1050px){
.socialLinks{grid-template-columns:1fr}
}

@media(max-width:900px){
.header{min-height:80px;padding:17px 6%}
.brand{font-size:23px}
.menuToggle{display:block;border:0;background:none;padding:10px 0 10px 15px;font-size:12px!important;color:#151515}
.navigation{display:none;position:absolute;top:100%;left:0;right:0;background:#faf9f6;padding:25px 6%;border-bottom:1px solid #ddd;flex-direction:column;align-items:stretch;gap:20px}
.navigation.open{display:flex}
.navigation>a{font-size:13px}
.navigation .navCta{justify-content:space-between}
.hero h1{font-size:65px;letter-spacing:-3px}
.heroCopy,.portrait{min-height:660px}
.heroCopy .eyebrow{font-size:8px;letter-spacing:1px}
.heroActions .button{padding:18px;gap:18px}
.portraitCaption{left:25px;right:25px}
.portraitCaption h2{font-size:34px}
.portraitCaption .button{gap:15px;padding:18px;font-size:10px}
.portraitTop{left:25px;font-size:7px}
.experienceBadge{right:25px;width:90px;height:90px}
.experienceBadge strong{font-size:33px}
.valuesBar{gap:35px}
.about{grid-template-columns:1fr;gap:30px}
.materialsOffer{gap:35px;padding-left:6%;padding-right:6%}
.materialsNumber .pill{font-size:7px}
.materialsNumber>strong{font-size:130px}
.materialsNumber>strong>span{font-size:47px}
.materialsCopy h2{font-size:35px}
.courseBody{padding:25px}
.courseBody h3{font-size:35px}
.courseFooter{align-items:flex-start;flex-direction:column}
.formLayout{grid-template-columns:1fr}
.reviewsGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
.guestIntro{grid-template-columns:.8fr 1fr;gap:30px}
.guestCopy h2{font-size:37px}
.guestServices{gap:7px}
.guestServices>span{font-size:10px;padding:9px 11px}
.guestCopy .eyebrow{font-size:8px;letter-spacing:1.3px}
.locationCard{padding:25px}
.contactSection .sectionHeading{align-items:flex-start;flex-direction:column}
}

/* ТЕЛЕФОН */
@media(max-width:760px){
html{scroll-padding-top:88px}
.section{padding:65px 6%}
.academy h2{letter-spacing:-1px}
.sectionHeading{flex-direction:column;align-items:flex-start;gap:23px;margin-bottom:32px}
.sectionIntro{max-width:420px}
.hero{grid-template-columns:1fr}
.heroCopy{min-height:auto;padding:40px 6% 25px}
.hero h1{margin-top:20px;font-size:clamp(65px,13vw,95px)}
.heroDescription{max-width:380px}
.heroActions{margin-top:28px;gap:25px}
.heroActions .button{padding:20px 23px;font-size:12px}
.heroBottom{padding-top:35px}
.portrait{min-height:650px}
.portraitCaption{bottom:30px}
.portraitCaption h2{font-size:41px}
.portraitCaption .button{font-size:12px;padding:20px;gap:25px}
.portraitTop{font-size:8px}
.valuesBar{gap:25px;padding:23px 4%}
.valuesBar span{font-size:8px;letter-spacing:1px}
.aboutColumns{grid-template-columns:1fr;gap:22px}
.stats{gap:15px;margin-top:30px}
.stats strong{font-size:45px}
.stats span{font-size:10px;line-height:1.6}
.materialsOffer{grid-template-columns:1fr;gap:35px;padding-top:55px;padding-bottom:55px}
.materialsNumber>strong{font-size:170px}
.materialsNumber>strong>span{font-size:60px}
.materialsCopy{text-align:center}
.materialsCopy .eyebrow{justify-content:center}
.materialsCopy>p:not(.eyebrow){margin-left:auto;margin-right:auto}
.materialsCopy h2{font-size:39px}
.materialsBrands{justify-content:center}
.courseGrid{grid-template-columns:1fr}
.courseBody h3{font-size:42px}
.courseDescription{min-height:0}
.courseFooter{flex-direction:row;align-items:flex-end}
.processGrid{grid-template-columns:1fr;gap:30px}
.processSymbol{display:none}
.processCard h3{margin-top:18px}
.processCard p{max-width:450px}
.statement{gap:20px;padding:40px 6%}
.statement p{font-size:26px}
.statement small{display:none}
.serviceGrid{grid-template-columns:1fr}
.servicePhoto{height:clamp(240px,65vw,380px)}
.guestSection{padding:65px 6%}
.guestIntro{grid-template-columns:1fr;gap:35px}
.guestPortrait{max-width:540px;width:100%;margin:0 auto}
.guestPortrait>img{max-height:none}
.guestCopy h2{font-size:clamp(36px,8vw,52px)}
.guestServices>span{font-size:12px;padding:10px 14px}
.guestPortfolio{margin-top:55px;padding-top:35px}
.guestPortfolio .sectionHeading h3{font-size:38px}
.galleryGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.compactGallery .galleryGrid{grid-template-columns:repeat(2,minmax(0,1fr))}
.compactGallery .galleryCaption strong{font-size:19px}
.galleryCaption strong{font-size:23px}
.galleryCaption>span{opacity:1;transform:none}
.locationGrid{grid-template-columns:1fr}
.locationCard h3{font-size:50px}
.locationMember{grid-template-columns:100px minmax(0,1fr) 24px;gap:20px}
.locationMemberPhoto{width:100px;height:125px}
.locationMemberArrow{display:block}
.closing{padding:75px 6%}
.footer{flex-wrap:wrap;padding:30px 6%}
.footer p{width:100%;order:3}
.footer>span{order:4}
.dialogBody{padding:30px 25px}
}

@media(max-width:540px){
.eyebrow{font-size:8px;letter-spacing:1.4px}
.portrait{min-height:590px}
.portraitCaption h2{font-size:36px}
.portraitCaption .button{font-size:11px;gap:20px}
.valuesBar{gap:18px}
.valuesBar span{font-size:7px}
.teamGrid{grid-template-columns:1fr;gap:25px}
.teamPhoto{aspect-ratio:4/4.6}
.teamBody h3{font-size:31px}
.teamBody{padding:25px}
.teamPhone{font-size:16px}
.teamDescription{font-size:13px}
.galleryToolbar{align-items:flex-start;flex-direction:column;gap:18px}
.galleryGrid{grid-template-columns:1fr;max-width:370px;margin:0 auto;gap:23px}
.galleryCard{aspect-ratio:4/5}
.galleryCaption strong{font-size:28px}
.compactGallery .galleryGrid{max-width:none;gap:12px}
.compactGallery .galleryCard{aspect-ratio:4/5}
.compactGallery .galleryCaption{left:12px;right:12px;bottom:15px}
.compactGallery .galleryCaption strong{font-size:17px}
.compactGallery .galleryCaption small{font-size:7px;line-height:1.5}
.compactGallery .galleryCaption>span{font-size:8px}
.compactGallery .galleryExpand{width:27px;height:27px;top:10px;right:10px;font-size:17px}
.compactGallery .galleryNumber{top:17px;left:12px}
.reviewsGrid{grid-template-columns:1fr}
.formAside{padding:30px 25px}
.formAside h3{font-size:31px}
.saForm{padding:27px 20px}
.formFields{grid-template-columns:1fr;gap:20px}
.saForm input,.saForm select,.saForm textarea{font-size:16px}
.contactPhone{font-size:28px}
.locationMember{grid-template-columns:85px minmax(0,1fr);gap:16px}
.locationMemberPhoto{width:85px;height:110px}
.locationMemberArrow{display:none}
.locationMemberInfo>strong{font-size:15px}
.locationMemberPhone{font-size:12px}
.socialLinks>a{min-height:95px;padding:20px;gap:15px}
.socialButtonText strong{font-size:21px}
.dialogBar{padding:13px 15px;gap:12px}
.dialogBar>span{font-size:10px}
.saDialog,.saDialogWide{width:calc(100vw - 16px)}
.dialogBody{padding:25px 20px}
.modalCopy h2{font-size:38px}
.modalCopy p:not(.eyebrow){font-size:13px}
.modalCopy .modalLead{font-size:18px!important}
.infoBox{padding:20px}
.serviceModalList li{font-size:16px;gap:10px;grid-template-columns:22px 1fr}
.viewerCaption{padding:16px;font-size:10px}
.galleryViewer>button{width:37px;height:37px;font-size:22px}
.viewerPrevious{left:10px}
.viewerNext{right:10px}
.galleryBottom{font-size:7px;line-height:1.8}
}

@media(max-width:380px){
.hero h1{font-size:61px}
.heroActions{gap:16px}
.heroActions .button{font-size:11px;padding:17px;gap:15px}
.heroActions .textLink{font-size:11px!important}
.portraitCaption h2{font-size:31px}
.portraitCaption .button{padding:16px;gap:12px;font-size:10px}
.courseBody h3{font-size:37px}
.courseFooter{align-items:flex-start;flex-direction:column}
.tileTitle{font-size:28px}
.contactPhone{font-size:25px}
.locationCard{padding:20px}
.locationMember{grid-template-columns:70px minmax(0,1fr);gap:12px}
.locationMemberPhoto{width:70px;height:95px}
.locationMemberInfo>strong{font-size:13px}
.locationMemberPhone{font-size:11px}
.socialButtonText strong{font-size:19px}
.socialButtonIcon{width:42px;height:42px}
.socialButtonText small{font-size:7px}
.socialButtonArrow{font-size:24px}
.materialsBrands{gap:10px}
.materialsBrands>span:not(.materialsAmpersand){font-size:13px;letter-spacing:1px}
.valuesBar{gap:12px}
}

@media(prefers-reduced-motion:reduce){
html{scroll-behavior:auto}
.academy *,.academy *::before,.academy *::after{animation:none!important;transition:none!important}
.button:hover,.serviceTile:hover,.galleryCard:hover>img,.serviceTile:hover .servicePhoto img,.socialLinks>a:hover{transform:none}
}
`;