export const playNotificationSound = () => {
    try {
        const audio = new Audio('/notification/notification.mp3');
        audio.volume = 0.5; // Điều chỉnh âm lượng từ 0.0 đến 1.0
        audio.play().catch(() => {
            // Trình duyệt chặn autoplay nếu người dùng chưa click/tương tác vào trang
        });
    } catch (e) {
        console.error(e);
    }
};
