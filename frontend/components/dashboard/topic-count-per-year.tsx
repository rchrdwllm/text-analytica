"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { year: "'16", count: 70 },
  { year: "'17", count: 90 },
  { year: "'18", count: 100 },
  { year: "'19", count: 92 },
  { year: "'20", count: 84 },
  { year: "'21", count: 84 },
  { year: "'22", count: 30 },
  { year: "'23", count: 102 },
  { year: "'24", count: 98 },
  { year: "'25", count: 96 },
];

const TopLabel = (props: any) => {
  const { x, y, value, width } = props;
  const px = x + (width ?? 0) / 2;
  const py = (y ?? 0) - 8;
  return (
    <text
      x={px}
      y={py}
      textAnchor="middle"
      fill="var(--muted-foreground, #0f172a)"
      fontSize={12}
    >
      {value}
    </text>
  );
};

const TopicCountPerYear = () => {
  return (
    <article className="flex flex-col space-y-2 bg-card p-4 rounded-lg h-full">
      <h2 className="font-medium text-lg">Topic Count per Year</h2>
      <ChartContainer
        config={{ count: { color: "var(--chart-5)" } }}
        className="flex-1 w-full [&_.recharts-bar-rectangle]:transition-all"
      >
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="transparent" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              padding={{ left: 8, right: 8 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value: number | string) =>
                Number(value).toLocaleString()
              }
              domain={[0, "dataMax + 20"]}
              ticks={[0, 25, 50, 75, 100, 125]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="count"
              name="Topics"
              fill="var(--color-count)"
              barSize={32}
            >
              <LabelList
                dataKey="count"
                content={(props) => <TopLabel {...props} />}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </article>
  );
};

export default TopicCountPerYear;
