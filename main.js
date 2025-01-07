/******************************************************************************
 * main.js
 *
 * 1) Countdown bis zur nächsten Musikstunde, jeden Freitag um 7:50,
 *    mit Sonderbehandlung:
 *      - Kein Unterricht an: 14.2, 14.3, 28.3, 18.4, 2.5, 30.5
 *      - Am 10.1 ist ein Test (keine normale Stunde).
 *
 * 2) Anzahl verbleibender Freitage (Musikstunden) bis zum 5. Juli,
 *    wobei oben genannte Sondertage ausgeschlossen werden.
 ******************************************************************************/


/** 
 * Array für alle Freitage ohne Unterricht.
 * Monate in JS: 0=Jan, 1=Feb, 2=März, 3=Apr, 4=Mai, ...
 */
const noLessonDates = [
    { month: 1, day: 14 },  // 14.2
    { month: 2, day: 14 },  // 14.3
    { month: 2, day: 28 },  // 28.3
    { month: 3, day: 18 },  // 18.4
    { month: 4, day: 2  },  // 2.5
    { month: 4, day: 30 },  // 30.5
  ];
  
  /** 
   * Testtag (keine normale Stunde). 
   * 10.1 -> { month: 0, day: 10 }
   */
  const testDate = { month: 0, day: 10 };
  
  /**
   * Prüft, ob ein Datum (JS Date) in der Liste der "noLessonDates" enthalten ist.
   */
  function isNoLessonDay(dateObj) {
    return noLessonDates.some(
      (d) =>
        d.month === dateObj.getMonth() &&
        d.day === dateObj.getDate()
    );
  }
  
  /**
   * Prüft, ob ein Datum der Testtag (10.1) ist.
   */
  function isTestDay(dateObj) {
    return (
      dateObj.getMonth() === testDate.month &&
      dateObj.getDate() === testDate.day
    );
  }
  
  /**
   * Gibt das nächste gültige "Musikstunden"-Datum zurück.
   * - Jeden Freitag um 7:50
   * - Überspringt Freitage ohne Unterricht (noLessonDates)
   * - Falls es der Testtag ist (10.1), wird dieses Datum zurückgegeben,
   *   mit dem Hinweis isTest=true.
   *
   * Return: { date: Date, isTest: boolean }
   */
  function getNextLessonDate() {
    const now = new Date();
    const nextLesson = new Date(now);
  
    // Ermittle den aktuellen Wochentag (0=So, 1=Mo, ... 5=Fr, 6=Sa)
    const dayOfWeek = now.getDay();
  
    // Wie viele Tage bis zum nächsten Freitag?
    let daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    nextLesson.setDate(now.getDate() + daysUntilFriday);
  
    // Uhrzeit auf Freitag 7:50 setzen
    nextLesson.setHours(7, 50, 0, 0);
  
    // Falls heute bereits Freitag ist und wir nach 7:50 Uhr haben,
    // dann auf den nächsten Freitag springen
    if (dayOfWeek === 5) {
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      if (currentHour > 7 || (currentHour === 7 && currentMinute >= 50)) {
        nextLesson.setDate(nextLesson.getDate() + 7);
      }
    }
  
    // Ggf. überspringen wir Freitage, an denen keine Stunde ist,
    // oder behandeln den Testtag.
    let foundValidDate = false;
    let isTest = false;
  
    while (!foundValidDate) {
      if (isNoLessonDay(nextLesson)) {
        // Kein Unterricht – um 7 Tage verschieben
        nextLesson.setDate(nextLesson.getDate() + 7);
      } else if (isTestDay(nextLesson)) {
        // Testtag
        isTest = true;
        foundValidDate = true;
      } else {
        foundValidDate = true;
      }
    }
  
    return { date: nextLesson, isTest };
  }
  
  /**
   * Zeigt den Countdown zur nächsten Musikstunde (oder Test) an.
   */
  function updateCountdown() {
    const now = new Date();
    const { date: nextLesson, isTest } = getNextLessonDate();
  
    // DOM-Elemente für die Quadrate
    const daysElem    = document.getElementById("days-value");
    const hoursElem   = document.getElementById("hours-value");
    const minsElem    = document.getElementById("minutes-value");
    const secsElem    = document.getElementById("seconds-value");
    const countdownTitle = document.getElementById("countdown-title");
    const infoMessage = document.getElementById("info-message");
  
    let diff = nextLesson - now;
  
    // Falls der Termin gerade ist oder schon vorbei -> entsprechend anzeigen
    if (diff <= 0) {
      infoMessage.textContent = 
        "Die Musikstunde (oder der Test) findet gerade statt oder ist schon vorbei.";
      // Alle Squares auf 0
      daysElem.textContent  = 0;
      hoursElem.textContent = 0;
      minsElem.textContent  = 0;
      secsElem.textContent  = 0;
      return;
    } else {
      // Text (unterhalb der Squares) leeren, falls vorher eine Meldung stand
      infoMessage.textContent = "";
    }
  
    // Überschrift ändern, wenn es sich um einen Testtermin handelt
    if (isTest) {
      countdownTitle.textContent = "Nächste Musikstunde (Test):";
    } else {
      countdownTitle.textContent = "Nächste Musikstunde:";
    }
  
    // Zeitdifferenz in Tage/Stunden/Minuten/Sekunden zerlegen
    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff         -= days * (1000 * 60 * 60 * 24);
  
    const hours   = Math.floor(diff / (1000 * 60 * 60));
    diff         -= hours * (1000 * 60 * 60);
  
    const minutes = Math.floor(diff / (1000 * 60));
    diff         -= minutes * (1000 * 60);
  
    const seconds = Math.floor(diff / 1000);
  
    // Werte in die Quadrate einsetzen
    daysElem.textContent  = days;
    hoursElem.textContent = hours;
    minsElem.textContent  = minutes;
    secsElem.textContent  = seconds;
  }
  
  /**
   * Ermittelt, wie viele Freitage noch bis zum 5. Juli übrig sind,
   * exklusive "noLessonDates" und Testtag.
   */
  function countRemainingFridays() {
    const endDate = new Date(new Date().getFullYear(), 6, 5); // 5. Juli
    const now = new Date();
  
    let count = 0;
    // tempDate startet am heutigen Tag
    const tempDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
    while (tempDate <= endDate) {
      // Ist es ein Freitag, und kein Sondertermin?
      if (
        tempDate.getDay() === 5 && 
        !isNoLessonDay(tempDate) &&
        !isTestDay(tempDate)
      ) {
        count++;
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
  
    return count;
  }
  
  // ------------------- Beim Laden der Seite -------------------
  document.addEventListener("DOMContentLoaded", () => {
    // Zeige die Anzahl der verbleibenden Musikstunden
    document.getElementById("lesson-count").textContent = countRemainingFridays();
  
    // Initiales Update des Countdowns
    updateCountdown();
    // Aktualisiere den Countdown jede Sekunde
    setInterval(updateCountdown, 1000);
  });