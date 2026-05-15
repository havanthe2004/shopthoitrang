import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {

    // if (totalPages <= 1) return null;

    return (
        <div className="p-5 flex items-center justify-between ">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Trang {currentPage} / {totalPages}
            </span>

            <div className="flex items-center gap-1">
                {/* Nút Prev */}
                <button
                    className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                >
                    <ChevronLeft size={18} />
                </button>

                {/* Danh sách số trang */}
                {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;

                    // Logic hiển thị trang: Trang đầu, trang cuối, và các trang lân cận trang hiện tại
                    if (page !== 1 && page !== totalPages && Math.abs(page - currentPage) > 1) {
                        // Trả về dấu "..." để UI chuyên nghiệp hơn (Thay vì chỉ ẩn đi như code cũ)
                        if (Math.abs(page - currentPage) === 2) {
                            return <span key={page} className="px-1 text-slate-400">...</span>;
                        }
                        return null; 
                    }

                    return (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
                                currentPage === page
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 border-indigo-600'
                                    : 'text-slate-500 hover:bg-slate-50 border border-slate-200 hover:text-indigo-600'
                            }`}
                        >
                            {page}
                        </button>
                    );
                })}

                {/* Nút Next */}
                <button
                    className="p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 rounded-xl disabled:opacity-20 transition-all shadow-sm border border-transparent"
                    disabled={currentPage === totalPages}
                    onClick={() => onPageChange(currentPage + 1)}
                >
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;