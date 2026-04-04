// src/utils/imageUrl.ts
export const getImageUrl = (imagePath: string) => {
    const BE_URL = 'http://localhost:3000'; // Thay bằng URL Backend của bạn
    if (!imagePath) return 'https://via.placeholder.com/1920x600';
    
    // Nếu path đã có http thì giữ nguyên, nếu không thì nối thêm BE_URL
    return imagePath.startsWith('http') ? imagePath : `${BE_URL}/${imagePath}`;
};