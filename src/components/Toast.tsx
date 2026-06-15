export type ToastKind = 'hit' | 'miss' | 'sunk' | 'enemy';

export interface ToastItem {
  id: number;
  text: string;
  kind: ToastKind;
}

const kindStyles: Record<ToastKind, string> = {
  hit: 'bg-emerald-600',
  miss: 'bg-slate-600',
  sunk: 'bg-red-600',
  enemy: 'bg-amber-600',
};

export function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-enter text-white text-sm font-semibold px-4 py-2 rounded shadow-lg ${kindStyles[toast.kind]}`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
