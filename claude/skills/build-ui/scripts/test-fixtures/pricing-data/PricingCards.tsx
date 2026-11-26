import { cn } from "@/lib/utils";
import { PLANS } from "./plans";

export function PricingCards() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={cn("rounded-lg border p-6", plan.featured && "bg-primary text-primary-foreground")}
        >
          <h3>{plan.name}</h3>
          <p>${plan.price}/mo</p>
        </div>
      ))}
    </div>
  );
}
