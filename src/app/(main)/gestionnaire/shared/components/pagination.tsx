"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface VehiclePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function VehiclePagination({
  currentPage,
  totalPages,
  onPageChange,
}: VehiclePaginationProps) {
  if (totalPages <= 1) return null;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Génère les numéros de pages avec ellipsis intelligent
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 3; // Réduit à 1 sur mobile pour gagner de la place

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (
        (i === currentPage - delta - 1 && currentPage - delta > 2) ||
        (i === currentPage + delta + 1 && currentPage + delta < totalPages - 1)
      ) {
        pages.push("...");
      }
    }

    return pages.filter((page, index, arr) => 
      page !== "..." || arr[index - 1] !== "..."
    );
  };

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      {/* Info de pagination */}
      <div className="text-sm text-zinc-500">
        Page <span className="font-semibold text-zinc-900">{currentPage}</span> sur{" "}
        <span className="font-semibold text-zinc-900">{totalPages}</span>
      </div>

      {/* Pagination principale */}
      <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-2xl p-1.5 shadow-sm w-full mx-auto overflow-x-auto lg:max-w-xl">
        
        {/* Bouton Précédent */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[110px]"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Précédent</span>
          <span className="sm:hidden">Préc.</span>
        </button>

        {/* Numéros de pages */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1 flex-1 justify-center">
          {getPageNumbers().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 sm:px-3 py-2 text-zinc-400 text-sm">...</span>
              ) : (
                <button
                  onClick={() => handlePageChange(page as number)}
                  className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all
                    ${
                      page === currentPage
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200"
                    }`}
                >
                  {page}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bouton Suivant */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px] sm:min-w-[110px] justify-end"
        >
          <span className="hidden sm:inline">Suivant</span>
          <span className="sm:hidden">Suiv.</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}