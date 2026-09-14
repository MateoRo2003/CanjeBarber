/** Bloque base para armar skeletons: un rectángulo con animación de pulso. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-border ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonFila() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40" />
      </div>
      <Skeleton className="h-9 w-24 rounded-lg" />
    </div>
  );
}

export function SkeletonLista({ filas = 3 }: { filas?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: filas }).map((_, i) => (
        <SkeletonFila key={i} />
      ))}
    </div>
  );
}
