import { Card } from "@/components/ui/Card";

const placeholderArtworks = [
  "Party Scene",
  "Culinary Scene",
  "Fashion Scene",
  "Music Scene",
  "Discovery Scene",
];

export function GalleryGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {placeholderArtworks.map((title, index) => (
        <Card className="aspect-square p-3" key={title}>
          <div className="flex h-full flex-col justify-between">
            <span className="text-xs font-semibold text-[var(--muted)]">
              0{index + 1}
            </span>
            <span className="text-sm font-semibold">{title}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
