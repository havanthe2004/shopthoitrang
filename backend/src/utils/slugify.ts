export const createSlug = (str: string) => {
    return str.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Xóa dấu
        .replace(/[đĐ]/g, "d")
        .replace(/([^0-9a-z-\s])/g, "") // Xóa ký tự đặc biệt
        .replace(/(\s+)/g, "-") // Đổi khoảng trắng thành dấu gạch ngang
        .replace(/-+/g, "-") // Xóa các dấu gạch ngang liên tiếp
        .replace(/^-+|-+$/g, ""); // Xóa gạch ngang ở đầu và cuối
};