export type TeamMember = {
  name: string;
  role: string;
  city: string;
  phone: string;
  tel: string;
  image: string;
  description?: string;
};

export type Variant = {
  label: string;
  price: number;
};

export type Course = {
  id: string;
  label: string;
  image: string;
  imageAlt: string;
  meta: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  variants: Variant[];
  program: string;
  instructor: string;
};

export type Service = {
  id: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  items: string[];
  itemPrices: Record<string, number | null>;
  specialistRole: string;
};

export type Content = {
  courses: Course[];
  services: Service[];
  team: TeamMember[];
};

export const euro = (price: number) =>
  price.toFixed(2).replace(".", ",") + " €";

export const discounted = (price: number) =>
  Math.round((price * 100) * 95 / 100) / 100;

export const courseName = (course: Course) =>
  [course.title, course.subtitle].filter(Boolean).join(" ");

export const courseOption = (course: Course, variant: Variant) =>
  `${courseName(course)} — ${variant.label} / ${euro(variant.price)}`;

export const serviceOption = (service: Service, item: string) =>
  `${service.title} — ${item}`;

export function validContent(value: unknown): value is Content {
  if (!value || typeof value !== "object") return false;

  const c = value as Content;

  return (
    Array.isArray(c.courses) &&
    Array.isArray(c.services) &&
    Array.isArray(c.team) &&
    c.courses.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        typeof x.subtitle === "string" &&
        typeof x.program === "string" &&
        Array.isArray(x.tags) &&
        Array.isArray(x.variants) &&
        x.variants.length > 0 &&
        x.variants.every(
          (v) =>
            typeof v.label === "string" &&
            Number.isFinite(v.price) &&
            v.price >= 0
        )
    ) &&
    c.services.every(
      (x) =>
        typeof x.id === "string" &&
        typeof x.title === "string" &&
        Array.isArray(x.items) &&
        x.itemPrices &&
        typeof x.specialistRole === "string"
    ) &&
    c.team.every(
      (x) =>
        typeof x.name === "string" &&
        typeof x.role === "string" &&
        typeof x.city === "string" &&
        typeof x.image === "string" &&
        typeof x.phone === "string" &&
        typeof x.tel === "string"
    )
  );
}