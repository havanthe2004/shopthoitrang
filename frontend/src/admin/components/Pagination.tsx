import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems?: number;
    pageSize?: number;
    itemName?: string;
    className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize = 10,
    itemName = 'mục',
    className = ''
}) => {
    if (totalPages <= 0) return null;

    // Tính khoảng hiển thị nếu có totalItems
    const startItem = totalItems !== undefined ? Math.min((currentPage - 1) * pageSize + 1, totalItems) : null;
    const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : null;

    // Sinh danh sách số trang thông minh
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 3) {
                pages.push('ellipsis-start');
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className={`p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 bg-white/60 backdrop-blur-xs select-none ${className}`}>
            {/* Thông tin số lượng */}
            <div className="text-xs text-gray-500 font-medium flex items-center gap-1.5 order-2 sm:order-1">
                {totalItems !== undefined && totalItems > 0 ? (
                    <span>
                        Hiển thị <span className="font-bold text-gray-800">{startItem}-{endItem}</span> trên tổng số{' '}
                        <span className="font-bold text-gray-800">{totalItems}</span> {itemName}
                    </span>
                ) : (
                    <span>
                        Trang <span className="font-black text-gray-900">{currentPage}</span> / <span className="font-bold text-gray-500">{totalPages}</span>
                    </span>
                )}
            </div>

            {/* Các nút chuyển trang */}
            <div className="flex items-center gap-1.5 order-1 sm:order-2">
                {/* Nút Về trang đầu (nếu nhiều hơn 5 trang) */}
                {totalPages > 5 && (
                    <button
                        type="button"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                        title="Trang đầu"
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 shadow-2xs disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                    >
                        <ChevronsLeft size={16} />
                    </button>
                )}

                {/* Nút Trang trước */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    title="Trang trước"
                    className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 shadow-2xs disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                >
                    <ChevronLeft size={16} />
                    <span className="hidden md:inline text-[11px]">Trước</span>
                </button>

                {/* Danh sách các số trang */}
                <div className="flex items-center gap-1">
                    {pages.map((item, idx) => {
                        if (typeof item === 'string') {
                            return (
                                <span
                                    key={`${item}-${idx}`}
                                    className="w-8 h-8 flex items-center justify-center text-xs font-black text-gray-400"
                                >
                                    •••
                                </span>
                            );
                        }

                        const isActive = currentPage === item;
                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() => onPageChange(item)}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs transition-all cursor-pointer active:scale-95 ${
                                    isActive
                                        ? 'bg-red-600 text-white font-black shadow-md shadow-red-600/25 ring-2 ring-red-600/20 border border-red-600'
                                        : 'bg-white text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 font-bold border border-gray-200 shadow-2xs'
                                }`}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* Nút Trang sau */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    title="Trang sau"
                    className="h-8 px-2.5 flex items-center justify-center gap-1 rounded-xl text-xs font-bold text-gray-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 shadow-2xs disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                >
                    <span className="hidden md:inline text-[11px]">Sau</span>
                    <ChevronRight size={16} />
                </button>

                {/* Nút Đến trang cuối (nếu nhiều hơn 5 trang) */}
                {totalPages > 5 && (
                    <button
                        type="button"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                        title="Trang cuối"
                        className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-500 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-gray-200 shadow-2xs disabled:opacity-25 disabled:pointer-events-none transition-all cursor-pointer active:scale-95"
                    >
                        <ChevronsRight size={16} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Pagination;