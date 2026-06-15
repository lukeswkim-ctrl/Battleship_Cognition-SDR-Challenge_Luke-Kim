import { useEffect, useState } from 'react';

export interface SinkToastItem {
  id: number;
  message: string;
  isPlayer: boolean;
}

interface SinkToastProps {
  toasts: SinkToastItem[];
  onDismiss: (id: number) => void;
}

export function SinkToast({ toasts, onDismiss }: SinkToastProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 pointer-events-none">
      {toasts.map((t) => (
        <Toast key={t.id} item={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function Toast({ item, onDismiss }: { item: SinkToastItem; onDismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(item.id), 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [item.id, onDismiss]);

  const bg = item.isPlayer ? 'bg-emerald-600' : 'bg-red-600';

  return (
    <div
      className={`${bg} text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
    >
      {item.message}
    </div>
  );
}
