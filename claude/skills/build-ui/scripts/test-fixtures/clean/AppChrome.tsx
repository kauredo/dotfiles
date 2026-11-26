import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Row = { id: string; name: string; detail: string };

export function GameList({ rows, isLast, shotType }: { rows: Row[]; isLast: boolean; shotType: string }) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Today</h2>
        <Link to="/schedule" className="flex items-center gap-1 text-sm text-primary hover:underline">
          Full week
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.id}>
            <Link to={`/games/${r.id}`} className="flex items-center gap-3 px-4 py-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium">{r.name}</p>
                <p className="text-sm text-slate-600">{r.detail}</p>
              </div>
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      {rows.map((r) => (
        <a key={r.id} href={`/techniques/${r.id}`} className="flex items-start gap-3 py-4">
          <span className="flex-1">
            <span className="block font-semibold">{r.name}</span>
            <span className="mt-1 block text-sm">{r.detail}</span>
          </span>
          <span aria-hidden="true">→</span>
        </a>
      ))}
      <Button className="rounded-md">
        {isLast ? "Done" : "Next"}
        <ChevronRight className="size-4" />
      </Button>
      <button
        className={`rounded-lg py-2 ${shotType === "3pt" ? "bg-purple-600 text-white" : "bg-slate-100"}`}
      >
        3PT
      </button>
    </div>
  );
}
