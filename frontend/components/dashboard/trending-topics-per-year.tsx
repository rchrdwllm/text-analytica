"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Sample data structure for trending topics per year, palitan ng actual data from backend
const data = [
  { year: "2025", topic: "A", value: 85, color: "var(--chart-5)" },
  { year: "2025", topic: "B", value: 95, color: "var(--chart-4)" },
  { year: "2025", topic: "C", value: 65, color: "var(--chart-3)" },
  // 2024
  { year: "2024", topic: "A", value: 80, color: "var(--chart-5)" },
  { year: "2024", topic: "D", value: 90, color: "var(--chart-4)" },
  { year: "2024", topic: "E", value: 50, color: "var(--chart-3)" },
  // 2023
  { year: "2023", topic: "A", value: 60, color: "var(--chart-5)" },
  { year: "2023", topic: "C", value: 62, color: "var(--chart-4)" },
  { year: "2023", topic: "F", value: 30, color: "var(--chart-3)" },
  // 2022
  { year: "2022", topic: "B", value: 55, color: "var(--chart-5)" },
  { year: "2022", topic: "D", value: 70, color: "var(--chart-4)" },
  { year: "2022", topic: "G", value: 45, color: "var(--chart-3)" },
];

const CustomLabel = (props: any) => {
  const { x, y, width, height } = props;
  const px = x + width + 8;
  const py = y + height / 2;

  return (
    <text
      x={px}
      y={py}
      textAnchor="start"
      fill="var(--foreground)"
      fontSize={14}
      fontWeight={400}
      dominantBaseline="middle"
    >
      {props.topic}
    </text>
  );
};

const TrendingTopicsPerYear = () => {
  const years = ["2025", "2024", "2023", "2022"];

  return (
    <article className="flex flex-col space-y-4 bg-card p-4 rounded-lg h-full">
      <h2 className="font-medium text-lg">Trending Topics per Year</h2>
      <div className="flex flex-col flex-1 justify-center space-y-4">
        {years.map((year) => {
          const yearData = data.filter((item) => item.year === year);
          return (
            <div key={year} className="flex items-center gap-4">
              <div className="w-16 font-medium text-muted-foreground text-right">
                {year}
              </div>

              <div className="flex-1">
                <ChartContainer
                  config={{
                    value: { color: "var(--chart-2)" },
                  }}
                  className="w-full h-[65px]"
                >
                  <ResponsiveContainer>
                    <BarChart
                      data={yearData}
                      layout="vertical"
                      margin={{ top: 5, right: 40, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid horizontal={false} stroke="transparent" />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="topic" hide />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ fill: "transparent" }}
                      />
                      <Bar dataKey="value" barSize={24}>
                        {yearData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                        <LabelList
                          dataKey="topic"
                          position="right"
                          content={(props: any) => (
                            <CustomLabel
                              {...props}
                              topic={yearData[props.index]?.topic}
                            />
                          )}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
};

export default TrendingTopicsPerYear;
