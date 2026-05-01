import { PackageOpen } from "lucide-react";

export function EmptyState({ title = "No items found", description = "There are no items to display at this time.", icon: Icon = PackageOpen }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed rounded-3xl border-slate-200 shadow-sm smooth-enter">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-slate-50">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-[250px] leading-relaxed">{description}</p>
    </div>
  );
}
