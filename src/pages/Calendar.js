import React, { useState, useMemo } from 'react';
import './Calendar.css';

import { buildDailyMap, fmt } from '../utils/calc';
import PokerCard from '../components/EntryCard';

const DAY_LABELS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S',
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/*
  Get today's date specifically in Eastern Time.

  America/New_York automatically switches between:
  EST = UTC-5
  EDT = UTC-4
*/
function getEasternDateParts() {
  const formatter = new Intl.DateTimeFormat(
    'en-US',
    {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  );

  const parts = formatter.formatToParts(
    new Date()
  );

  const values = {};

  parts.forEach((part) => {
    if (
      part.type === 'year' ||
      part.type === 'month' ||
      part.type === 'day'
    ) {
      values[part.type] = part.value;
    }
  });

  return {
    year: Number(values.year),
    month: Number(values.month) - 1,
    day: Number(values.day),

    dateString:
      `${values.year}-${values.month}-${values.day}`,
  };
}

export default function Calendar({
  poker = [],
}) {
  const easternToday =
    getEasternDateParts();

  const [year, setYear] = useState(
    easternToday.year
  );

  const [month, setMonth] = useState(
    easternToday.month
  );

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const dailyMap = useMemo(
    () => buildDailyMap(poker),
    [poker]
  );

  /*
    IMPORTANT:
    This is now Eastern Time,
    NOT UTC.
  */
  const todayStr =
    easternToday.dateString;

  function changeMonth(dir) {
    let m = month + dir;
    let y = year;

    if (m < 0) {
      m = 11;
      y--;
    }

    if (m > 11) {
      m = 0;
      y++;
    }

    setMonth(m);
    setYear(y);
    setSelectedDate(null);
  }

  const firstDay =
    new Date(
      year,
      month,
      1
    ).getDay();

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const monthStr =
    `${year}-${String(
      month + 1
    ).padStart(2, '0')}`;

  const monthPnl =
    Object.entries(dailyMap)
      .filter(([date]) =>
        date.startsWith(monthStr)
      )
      .reduce(
        (total, [, value]) =>
          total + value,
        0
      );

  const dayPoker = selectedDate
    ? poker.filter(
        (p) =>
          p.date === selectedDate
      )
    : [];

  const dayPnl =
    selectedDate
      ? dailyMap[selectedDate] || 0
      : 0;

  return (
    <div className="page calendar-page">
      {/* HEADER */}

      <div className="page-header">
        <div>
          <h1 className="page-title">
            Calendar
          </h1>
        </div>

        <span
          className={`badge ${
            monthPnl >= 0
              ? 'badge-green'
              : 'badge-red'
          }`}
        >
          {MONTH_NAMES[month].slice(
            0,
            3
          )}{' '}
          {fmt(monthPnl)}
        </span>
      </div>

      {/* MONTH NAVIGATION */}

      <div className="month-nav">
        <button
          className="month-arrow"
          onClick={() =>
            changeMonth(-1)
          }
          aria-label="Previous month"
          type="button"
        >
          <i
            className="ti ti-chevron-left"
            aria-hidden="true"
          />
        </button>

        <span className="month-name">
          {MONTH_NAMES[month]}{' '}
          {year}
        </span>

        <button
          className="month-arrow"
          onClick={() =>
            changeMonth(1)
          }
          aria-label="Next month"
          type="button"
        >
          <i
            className="ti ti-chevron-right"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* CALENDAR */}

      <div className="cal-grid">
        {DAY_LABELS.map(
          (label, index) => (
            <div
              key={index}
              className="cal-dow"
            >
              {label}
            </div>
          )
        )}

        {Array.from({
          length: firstDay,
        }).map((_, index) => (
          <div
            key={`empty-${index}`}
            className="cal-cell empty"
          />
        ))}

        {Array.from({
          length: daysInMonth,
        }).map((_, index) => {
          const day = index + 1;

          const dateString =
            `${year}-${String(
              month + 1
            ).padStart(
              2,
              '0'
            )}-${String(day).padStart(
              2,
              '0'
            )}`;

          const pnl =
            dailyMap[dateString];

          const isToday =
            dateString === todayStr;

          const isSelected =
            dateString ===
            selectedDate;

          const hasActivity =
            pnl !== undefined;

          let cellClass =
            'cal-cell';

          if (isToday) {
            cellClass += ' today';
          }

          if (isSelected) {
            cellClass +=
              ' selected';
          }

          if (hasActivity) {
            cellClass +=
              pnl >= 0
                ? ' has-pos'
                : ' has-neg';
          }

          return (
            <button
              key={dateString}
              className={
                cellClass
              }
              onClick={() =>
                setSelectedDate(
                  dateString ===
                    selectedDate
                    ? null
                    : dateString
                )
              }
              aria-label={`${dateString}${
                hasActivity
                  ? `, ${fmt(
                      pnl
                    )}`
                  : ''
              }`}
              type="button"
            >
              <span className="cal-num">
                {day}
              </span>

              {hasActivity && (
                <span
                  className={`cal-pnl ${
                    pnl >= 0
                      ? 'pos'
                      : 'neg'
                  }`}
                >
                  {pnl >= 0
                    ? '+'
                    : ''}
                  $
                  {Math.abs(
                    pnl
                  ).toFixed(2)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SELECTED DAY */}

      {selectedDate && (
        <div className="day-detail">
          <div className="section-hdr">
            <span className="section-label">
              {new Date(
                `${selectedDate}T12:00:00`
              ).toLocaleDateString(
                'en-US',
                {
                  timeZone:
                    'America/New_York',
                  weekday:
                    'short',
                  month:
                    'short',
                  day:
                    'numeric',
                }
              )}
            </span>

            {dayPoker.length >
              0 && (
              <span
                className={`badge ${
                  dayPnl >= 0
                    ? 'badge-green'
                    : 'badge-red'
                }`}
              >
                {fmt(dayPnl)}
              </span>
            )}
          </div>

          {dayPoker.length ===
          0 ? (
            <p className="day-empty">
              No poker sessions on
              this day.
            </p>
          ) : (
            dayPoker.map(
              (session) => (
                <PokerCard
                  key={
                    session.id
                  }
                  session={
                    session
                  }
                  compact
                />
              )
            )
          )}
        </div>
      )}
    </div>
  );
}