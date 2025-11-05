"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingTopic } from "@/types";

// Build chart data from the `trendingTopics` prop.
// Each TrendingTopic.group is treated as the year. For each year we take
// the top 3 topics by `document_count` and use the first keyword as the label.
// Colors are assigned in the same order used previously.

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

type TrendingTopicsPerGroupProps = {
  trendingTopics: TrendingTopic[];
};

const TrendingTopicsPerGroup = ({
  trendingTopics = [],
}: TrendingTopicsPerGroupProps) => {
  // derive years from incoming data; fall back to sample years if empty
  const years: string[] =
    trendingTopics.length > 0
      ? trendingTopics
          .map((t) => t.group)
          // try numeric descending if possible
          .sort((a, b) => Number(b) - Number(a))
      : ["2025", "2024", "2023", "2022"];

  const colors = [
    "var(--chart-5)",
    "var(--chart-4)",
    "var(--chart-3)",
    "var(--chart-2)",
    "var(--chart-1)",
  ];

  type ChartEntry = {
    year: string;
    topic: string;
    value: number;
    color: string;
  };

  const data: ChartEntry[] = trendingTopics.flatMap((group) => {
    const year = group.group;
    const topTopics = [...group.topics]
      .sort((a, b) => b.document_count - a.document_count)
      .slice(0, 3);

    return topTopics.map((topic, idx) => ({
      year,
      topic: topic.keywords?.[0]?.word ?? `Topic ${topic.topic_id}`,
      value: topic.document_count,
      color: colors[idx % colors.length],
    }));
  });

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

export default TrendingTopicsPerGroup;
