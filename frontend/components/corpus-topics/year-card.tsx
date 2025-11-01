import { cn } from "@/lib/utils";

const YearCard = () => {
  const isActive = false;

  return (
    <article
      className={cn(
        "bg-card hover:bg-primary/10 p-4 rounded-lg hover:text-primary transition-colors cursor-pointer",
        isActive && "hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <h3 className="font-medium text-lg">2025</h3>
      <p>000 Topics</p>
      <p>000 Documents</p>
    </article>
  );
};

export default YearCard;
