"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { DocumentTopicCount, getTopicCountPerGroup } from "@/lib/dashboard";
import { useEffect, useState } from "react";

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
  const [documents, setDocuments] = useState<DocumentTopicCount[]>([]);
  useEffect(() => {
    let isCancelled = false;
    (async () => {
      const { documents } = await getTopicCountPerGroup();
      if (isCancelled) return;

      setDocuments(documents);
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <article className="flex flex-col space-y-2 bg-card p-4 rounded-lg h-full">
      <h2 className="flex-shrink-0 font-medium text-lg">
        Topic Count per Group
      </h2>
      <ChartContainer
        config={{ count: { color: "var(--chart-5)" } }}
        className="flex-1 w-full min-h-0 [&_.recharts-bar-rectangle]:transition-all"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={documents}
            margin={{ top: 24, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="transparent" />
            <XAxis
              dataKey="group"
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
              domain={[0, "dataMax + 2"]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />

            <Bar
              dataKey="topicCount"
              name="Topics"
              fill="var(--color-count)"
              barSize={32}
            >
              <LabelList
                dataKey="topicCount"
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
