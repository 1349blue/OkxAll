class Support {
    constructor() {
        // Khởi tạo AudioContext một lần và tái sử dụng
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Phát âm thanh thông báo
    thongBaoTaget() {
        try {
            // Kiểm tra xem browser có hỗ trợ Web Audio API không
            if (!this.audioContext) {
                throw new Error('Web Audio API not supported');
            }
            
            // Tạo nguồn âm thanh
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            // Kết nối các node
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Kiểu sóng tạo âm thanh
            oscillator.type = 'sine';

            // Tần số cơ bản cho tiếng gõ cửa (khoảng 100-200Hz)
            const baseFrequency = 150;
            
            // Thời gian bắt đầu
            const startTime = this.audioContext.currentTime;

            // Thời gian phát âm thanh tổng cộng
            const playDuration = 0.5; // 0.5 giây

            // Tạo hiệu ứng tiếng gõ cửa
            oscillator.frequency.setValueAtTime(baseFrequency, startTime);
            oscillator.frequency.setValueAtTime(baseFrequency, startTime + 0.1);
            oscillator.frequency.setValueAtTime(baseFrequency, startTime + 0.2);

            // Điều chỉnh âm lượng để tạo hiệu ứng gõ cửa
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(1, startTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, startTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(1, startTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0, startTime + 0.3);

            // Bắt đầu và kết thúc âm thanh
            oscillator.start(startTime);
            oscillator.stop(startTime + playDuration);
        } catch (error) {
            console.error('Error playing sound:', error);
        }
    }

    // Hiển thị thông báo
    showAlert(message, duration = 2000) {
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        // Hiển thị alert
        alertBox.style.display = 'block';
        this.thongBaoTaget();

        // Tự động ẩn sau thời gian duration
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.remove(); // Xóa phần tử khỏi DOM
        }, duration);
    }

    // Thêm các phương thức tiện ích khác
    formatPrice(price, decimals = 8) {
        return Number(price).toFixed(decimals);
    }

    formatDate(date) {
        return new Date(date).toLocaleString();
    }

    validateNumber(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    // Thêm phương thức để kiểm tra kết nối mạng
    checkConnection() {
        return navigator.onLine;
    }

    // Thêm phương thức để lưu log
    logError(error, context = '') {
        console.error(`[${new Date().toISOString()}] ${context}:`, error);
    }
}

// Tạo instance mặc định
const support = new Support();

// Export instance mặc định
export default support;

// Export class nếu cần tạo nhiều instance
export { Support }; 