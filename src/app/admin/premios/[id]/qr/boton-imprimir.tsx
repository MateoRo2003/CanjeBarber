"use client";

export function BotonImprimir() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-stone-900 px-6 py-2 text-sm font-medium text-white print:hidden"
    >
      Imprimir
    </button>
  );
}
