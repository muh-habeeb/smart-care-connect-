import { PackageOpen } from "lucide-react";

export function EmptyState({ title = "No items found", description = "There are no items to display at this time.", icon: Icon = PackageOpen }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed rounded-xl border-slate-200 smooth-enter">
      <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-slate-50">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}
