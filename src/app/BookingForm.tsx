"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";

const serviceOptions = [
  "Маникюр с гел лак",
  "Маникюр — поддръжка",
  "Изграждане",
  "Педикюр",
  "Спа педикюр",
  "Миглопластика — косъм по косъм",
  "Миглопластика — 2–3D обем",
  "Миглопластика — мега обем",
  "Миглопластика — Wispy ефект",
  "Миглопластика — очна линия",
  "Миглопластика — арабски ефект",
  "Почистване на лице",
  "Кола маска — цяло тяло",
  "Кола маска — вежди",
  "RF кавитация",
  "Пресотерапия",
];

const courseOptions = [
  "Базов курс „Маникюр“ — 3 модула / 1 300 €",
  "Ламиниране на мигли — 1 ден / 300 €",
  "Ламиниране на мигли — 2 дни / 450 €",
];

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

export default function BookingForm() {
  const [bookingType, setBookingType] = useState<"service" | "course">(
    "service"
  );
  const [salon, setSalon] = useState("");
  const [offering, setOffering] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const options =
    bookingType === "service" ? serviceOptions : courseOptions;

  function changeType(type: "service" | "course") {
    setBookingType(type);
    setOffering("");
    setError("");
    setSuccess("");
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) return;

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

    if (!["haskovo", "plovdiv"].includes(salon)) {
      setError("Избери салон.");
      return;
    }

    if (!options.includes(offering)) {
      setError("Избери услуга или обучение.");
      return;
    }

    if (customerName.length < 2) {
      setError("Въведи име с поне 2 символа.");
      return;
    }

    if (phone.replace(/\D/g, "").length < 7) {
      setError("Въведи валиден телефон за връзка.");
      return;
    }

    if (!preferredDate || preferredDate < todayInSofia()) {
      setError("Избери днешна или бъдеща дата.");
      return;
    }

    if (!preferredTime) {
      setError("Избери желан час.");
      return;
    }

    const submittedSalon = salon === "haskovo" ? "Хасково" : "Пловдив";

    setSubmitting(true);

    try {
      const { error: databaseError } = await supabase
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
          note: note || null,
        });

      if (databaseError) {
        console.error("Booking submission failed:", databaseError.code);
        throw new Error(
          "Заявката не беше изпратена. Опитай отново или се обади на 0876 667 797."
        );
      }

      form.reset();
      setSalon("");
      setOffering("");

      setSuccess(
        `Заявката ти за ${submittedSalon} е изпратена успешно. ` +
          "София ще се свърже с теб за потвърждение. " +
          "Датата и часът все още не са резервирани."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Възникна грешка. Моля, опитай отново."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="booking" className="bookingSection">
      <div className="bookingHeading">
        <div>
          <p className="bookingEyebrow">ЗАПИСВАНЕ / SARANDEV ACADEMY</p>
          <h2>
            Време за теб.
            <br />
            <em>Или за ново начало.</em>
          </h2>
        </div>

        <p className="bookingIntro">
          Избери салон, услуга или обучение и ни изпрати
          предпочитаните дата и час.
        </p>
      </div>

      <div className="bookingLayout">
        <aside className="bookingAside">
          <span className="bookingStar" aria-hidden="true">✳</span>

          <h3>Ти избираш.<br /><em>Ние потвърждаваме.</em></h3>

          <ol>
            <li>Избираш Хасково или Пловдив.</li>
            <li>Посочваш услуга или курс.</li>
            <li>Предлагаш удобни дата и час.</li>
            <li>София се свързва с теб.</li>
          </ol>

          <div className="bookingNotice">
            <strong>Важно за записването</strong>
            <p>
              Това е заявка за предпочитан час. Записването
              е валидно след потвърждение от София.
            </p>
          </div>

          <a href="tel:+359876667797" className="bookingPhone">
            Въпроси? 0876 667 797 ↗
          </a>
        </aside>

        <form className="bookingForm" onSubmit={submitBooking}>
          <fieldset disabled={submitting}>
            <legend className="bookingLegend">ТВОЯТА ЗАЯВКА</legend>

            <div className="bookingTypeButtons">
              <button
                type="button"
                className={bookingType === "service" ? "selected" : ""}
                aria-pressed={bookingType === "service"}
                onClick={() => changeType("service")}
              >
                Услуга <span>↗</span>
              </button>
              <button
                type="button"
                className={bookingType === "course" ? "selected" : ""}
                aria-pressed={bookingType === "course"}
                onClick={() => changeType("course")}
              >
                Обучение <span>↗</span>
              </button>
            </div>

            <div className="bookingFields">
              <label className="fullWidth">
                <span>Салон *</span>
                <select
                  name="salon"
                  required
                  value={salon}
                  onChange={(event) => setSalon(event.target.value)}
                >
                  <option value="">Избери салон</option>
                  <option value="haskovo">
                    Хасково — ул. „Преслав“ № 23
                  </option>
                  <option value="plovdiv">
                    Пловдив — ул. „Петко Д. Петков“ № 74
                  </option>
                </select>
              </label>

              <label className="fullWidth">
                <span>
                  {bookingType === "service" ? "Услуга *" : "Обучение *"}
                </span>
                <select
                  name="offering"
                  required
                  value={offering}
                  onChange={(event) => setOffering(event.target.value)}
                >
                  <option value="">
                    {bookingType === "service"
                      ? "Избери услуга"
                      : "Избери обучение"}
                  </option>

                  {options.map((option) => (
                    <option value={option} key={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>
                  {bookingType === "course"
                    ? "Желана начална дата *"
                    : "Желана дата *"}
                </span>
                <input name="preferred_date" type="date" required />
              </label>

              <label>
                <span>Желан час *</span>
                <input
                  name="preferred_time"
                  type="time"
                  step={900}
                  required
                />
              </label>

              <p className="bookingHint fullWidth">
                Наличността се уточнява при потвърждение.
                За многодневен курс посочи желаната начална дата.
              </p>

              <label>
                <span>Име и фамилия *</span>
                <input
                  name="customer_name"
                  type="text"
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

            <p className="bookingPrivacy">
              Използваме предоставените данни за връзка с теб
              относно тази заявка.
            </p>

            <button type="submit" className="bookingSubmit">
              {submitting ? "Изпращане…" : "Изпрати заявка"}
              <span aria-hidden="true">{submitting ? "…" : "↗"}</span>
            </button>
          </fieldset>

          {error && (
            <p className="bookingMessage bookingError" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="bookingMessage bookingSuccess" role="status">
              {success}
            </p>
          )}
        </form>
      </div>

      <style jsx>{`
        .bookingSection {
          padding: 100px 7%;
          background: #efefef;
          color: #151515;
        }

        .bookingHeading {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 35px;
          margin-bottom: 45px;
        }

        .bookingEyebrow {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          margin: 0 0 22px !important;
        }

        .bookingHeading h2 {
          font-size: clamp(35px, 4.2vw, 65px);
          line-height: 1.12;
          letter-spacing: -2px;
          margin: 0;
        }

        .bookingIntro {
          max-width: 300px;
          font-size: 14px;
          color: #666;
          line-height: 1.8;
        }

        .bookingLayout {
          display: grid;
          grid-template-columns: .8fr 1.2fr;
          background: #fff;
          border: 1px solid #d4d4d4;
        }

        .bookingAside {
          background: #151515;
          color: #fff;
          padding: 45px;
        }

        .bookingStar {
          display: inline-block;
          font-size: 75px;
          line-height: 1;
        }

        .bookingAside h3 {
          font-size: 31px;
          line-height: 1.2;
          letter-spacing: -1px;
          margin: 30px 0;
        }

        .bookingAside ol {
          padding-left: 20px;
          color: #ccc;
          font-size: 13px;
          line-height: 1.8;
        }

        .bookingAside li {
          padding-left: 5px;
          margin-bottom: 13px;
        }

        .bookingNotice {
          border-top: 1px solid #ffffff35;
          margin-top: 35px;
          padding-top: 25px;
        }

        .bookingNotice strong {
          font-size: 13px;
        }

        .bookingNotice p {
          font-size: 12px;
          line-height: 1.9;
          color: #bbb;
          margin-top: 12px;
        }

        .bookingPhone {
          display: inline-block;
          margin-top: 30px;
          border-bottom: 1px solid #777;
          padding-bottom: 7px;
          font-size: 13px;
        }

        .bookingForm {
          padding: 40px;
        }

        fieldset {
          border: 0;
          padding: 0;
          margin: 0;
          min-width: 0;
        }

        fieldset:disabled {
          opacity: .65;
        }

        .bookingLegend {
          font-size: 9px;
          letter-spacing: 2px;
          margin-bottom: 22px;
          padding: 0;
        }

        .bookingTypeButtons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 28px;
        }

        .bookingTypeButtons button {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          background: #fff;
          border: 1px solid #ccc;
          padding: 17px;
          color: #151515;
          font-size: 13px;
          transition: background .2s, color .2s;
        }

        .bookingTypeButtons button.selected {
          background: #151515;
          border-color: #151515;
          color: #fff;
        }

        .bookingFields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 22px 18px;
        }

        .fullWidth {
          grid-column: 1 / -1;
        }

        label {
          display: flex;
          flex-direction: column;
          gap: 10px;
          min-width: 0;
        }

        label > span {
          font-size: 12px;
          font-weight: 700;
        }

        input, select, textarea {
          display: block;
          width: 100%;
          min-width: 0;
          border: 1px solid #ccc;
          border-radius: 0;
          background: #fff;
          color: #151515;
          padding: 14px 12px;
          font: inherit;
          font-size: 14px;
        }

        textarea {
          resize: vertical;
        }

        input:focus, select:focus, textarea:focus {
          outline: 1px solid #151515;
          border-color: #151515;
        }

        .bookingHint {
          font-size: 11px;
          line-height: 1.8;
          color: #777;
          margin-top: -10px !important;
        }

        .bookingPrivacy {
          margin-top: 22px !important;
          font-size: 11px;
          color: #777;
          line-height: 1.8;
        }

        .bookingSubmit {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          width: 100%;
          margin-top: 20px;
          padding: 19px 22px;
          border: 0;
          background: #151515;
          color: #fff;
          font-size: 13px;
          font-weight: 700;
        }

        .bookingSubmit span {
          font-size: 22px;
        }

        .bookingMessage {
          margin-top: 20px !important;
          padding: 18px;
          font-size: 13px;
          line-height: 1.8;
        }

        .bookingError {
          background: #fff0f0;
          color: #a32323;
          border: 1px solid #efcaca;
        }

        .bookingSuccess {
          background: #edf6ee;
          color: #23512c;
          border: 1px solid #c6dfca;
        }

        @media (max-width: 900px) {
          .bookingLayout {
            grid-template-columns: 1fr;
          }

          .bookingHeading {
            flex-direction: column;
            align-items: flex-start;
            gap: 22px;
          }

          .bookingIntro {
            max-width: 450px;
          }

          .bookingAside {
            padding: 30px;
          }

          .bookingStar {
            font-size: 50px;
          }
        }

        @media (max-width: 600px) {
          .bookingSection {
            padding: 65px 6%;
          }

          .bookingHeading h2 {
            letter-spacing: -1px;
          }

          .bookingForm {
            padding: 25px 20px;
          }

          .bookingFields {
            grid-template-columns: 1fr;
          }

          input, select, textarea {
            font-size: 16px;
          }

          .bookingAside h3 {
            font-size: 28px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}