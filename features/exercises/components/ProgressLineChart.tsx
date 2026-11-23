"use client";

import { useEffect, useRef, useState } from "react";

export type ProgressChartPoint = {
  /** Unique per point (the workout log id). */
  key: string;
  value: number;
  /** Short date under the axis, e.g. "Nov 12". */
  label: string;
  /** Read out for the point, e.g. "Nov 12, 2026: 45 kg". */
  description: string;
  /** The session isn't finished: the segment leading to it is dashed and its marker is hollow. */
  inProgress: boolean;
};

type ProgressLineChartProps = {
  points: ProgressChartPoint[];
  /** Name of what is plotted, for the chart's accessible label. */
  title: string;
  /** Index of the point whose details are shown (hovered or picked), or null. */
  activeIndex: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
};

const HEIGHT = 220;
const MARGIN = { top: 12, right: 16, bottom: 28, left: 56 };
const SERIES = "#00A62C";
const GRID = "#e7e5e4";
const AXIS_TEXT = "#71717a";

/** A rounded-up axis maximum with some headroom (1, 2 or 5 times a power of ten). */
function niceMaxValue(max: number): number {
  if (max <= 0) return 10;
  const padded = max * 1.15;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  const normalized = padded / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
  return nice * magnitude;
}

/** At most about four date labels: the first, the last and evenly spaced ones between. */
function showsDateLabel(index: number, total: number): boolean {
  if (total <= 4 || index === 0 || index === total - 1) return true;
  return index % Math.ceil((total - 1) / 3) === 0;
}

/**
 * One series over sessions (evenly spaced, oldest left), in kg from zero. Hovering, focusing or clicking a
 * point makes it the active one; the parent shows that session's details next to the chart.
 */
export function ProgressLineChart({
  points,
  title,
  activeIndex,
  onHover,
  onSelect,
}: ProgressLineChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));
    observer.observe(element);
    // ResizeObserver only reports while the page is being painted; measure once without waiting for that.
    const firstMeasure = setTimeout(() => setWidth(Math.floor(element.clientWidth)), 0);
    return () => {
      clearTimeout(firstMeasure);
      observer.disconnect();
    };
  }, []);

  const plotWidth = Math.max(0, width - MARGIN.left - MARGIN.right);
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  const maxValue = niceMaxValue(Math.max(0, ...points.map((point) => point.value)));
  const step = points.length > 1 ? plotWidth / (points.length - 1) : 0;

  const x = (index: number) => MARGIN.left + (points.length > 1 ? index * step : plotWidth / 2);
  const y = (value: number) => MARGIN.top + plotHeight - (value / maxValue) * plotHeight;

  const lastIndex = points.length - 1;
  const dashedFrom = points[lastIndex]?.inProgress && points.length >= 2 ? lastIndex - 1 : null;
  const solidPoints = dashedFrom === null ? points : points.slice(0, dashedFrom + 1);
  const linePath = solidPoints
    .map((point, index) => `${index === 0 ? "M" : "L"}${x(index)},${y(point.value)}`)
    .join(" ");

  return (
    <div ref={containerRef} className="w-full">
      {width > 0 && (
        <svg
          width={width}
          height={HEIGHT}
          role="group"
          aria-label={`${title} per session, line chart`}
          onMouseLeave={() => onHover(null)}
        >
          {[0, maxValue / 2, maxValue].map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={width - MARGIN.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke={GRID}
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={y(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={11}
                fill={AXIS_TEXT}
              >
                {Math.round(tick)} kg
              </text>
            </g>
          ))}

          {activeIndex !== null && points[activeIndex] && (
            <line
              x1={x(activeIndex)}
              x2={x(activeIndex)}
              y1={MARGIN.top}
              y2={MARGIN.top + plotHeight}
              stroke={SERIES}
              strokeOpacity={0.25}
              strokeWidth={2}
            />
          )}

          {solidPoints.length > 1 && (
            <path d={linePath} fill="none" stroke={SERIES} strokeWidth={2} strokeLinejoin="round" />
          )}
          {dashedFrom !== null && (
            <line
              x1={x(dashedFrom)}
              y1={y(points[dashedFrom].value)}
              x2={x(lastIndex)}
              y2={y(points[lastIndex].value)}
              stroke={SERIES}
              strokeWidth={2}
              strokeDasharray="6 5"
            />
          )}

          {points.map((point, index) => (
            <g key={point.key}>
              {showsDateLabel(index, points.length) && (
                <text
                  x={x(index)}
                  y={HEIGHT - 8}
                  textAnchor={
                    points.length > 1 && index === 0
                      ? "start"
                      : points.length > 1 && index === lastIndex
                        ? "end"
                        : "middle"
                  }
                  fontSize={11}
                  fill={AXIS_TEXT}
                >
                  {point.label}
                </text>
              )}
              <circle
                cx={x(index)}
                cy={y(point.value)}
                r={index === activeIndex ? 6 : 4}
                fill={point.inProgress ? "#ffffff" : SERIES}
                stroke={point.inProgress ? SERIES : "#ffffff"}
                strokeWidth={2}
              />
              {/* The hit target is the whole column, not the 8px marker. */}
              <rect
                x={x(index) - Math.max(22, step / 2)}
                y={MARGIN.top}
                width={Math.max(44, step)}
                height={plotHeight}
                fill="transparent"
                tabIndex={0}
                role="button"
                aria-label={point.description}
                aria-pressed={index === activeIndex}
                className="cursor-pointer outline-none focus-visible:stroke-zinc-900"
                onMouseEnter={() => onHover(index)}
                onFocus={() => onSelect(index)}
                onClick={() => onSelect(index)}
              />
            </g>
          ))}
        </svg>
      )}
    </div>
  );
}
