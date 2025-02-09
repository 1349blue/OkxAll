class AutoTradeManager {
    constructor() {
        this.layout = null;
        this.isAutoTrading = false;
        this.autoTradeTimer = null;
    }

    createLayout() {
        const layout = document.createElement('div');
        layout.className = 'table-component';
        layout.id = 'layout7';
        layout.innerHTML = `
            <h2>Cài đặt giao dịch tự động</h2>
            <div class="auto-trade-settings">
                <table>
                    <tr>
                        <td>
                            <label>Biên độ giá bán (%):</label>
                            <input type="number" id="marginPercentage" value="10">
                        </td>
                        <td>
                            <label>Giá cơ sở (USDT):</label>
                            <input type="number" id="basePrice" value="10">
                        </td>
                        <td>
                            <label>Số lượng token:</label>
                            <input type="number" id="tokenAmount" value="100">
                        </td>
                        <td>
                            <label>Trạng thái:</label>
                            <select id="enumStatus">
                                <option value="0">Đã mua</option>
                                <option value="1">Đã bán</option>
                            </select>
                        </td>
                    </tr>
                </table>
                <table id="logicTable">
                    <thead>
                        <tr>
                            <th>Loại</th>
                            <th>Logic chính (d)</th>
                            <th>Logic đối lập (a)</th>
                            <th>Giá kích hoạt</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr id="sellLogic">
                            <td>Bán</td>
                            <td id="d_b">1</td>
                            <td id="a_b">-1</td>
                            <td id="sellPrice">0</td>
                        </tr>
                        <tr id="buyLogic">
                            <td>Mua</td>
                            <td id="d_m">1</td>
                            <td id="a_m">-1</td>
                            <td id="buyPrice">0</td>
                        </tr>
                    </tbody>
                </table>
                <button id="startAutoTrade">Bắt đầu giao dịch tự động</button>
            </div>
        `;

        this.layout = layout;
        this.setupEventListeners();
        return layout;
    }

    setupEventListeners() {
        const startButton = this.layout.querySelector('#startAutoTrade');
        startButton.addEventListener('click', () => this.toggleAutoTrading());
    }

    toggleAutoTrading() {
        this.isAutoTrading = !this.isAutoTrading;
        const startButton = this.layout.querySelector('#startAutoTrade');
        
        if (this.isAutoTrading) {
            startButton.textContent = 'Dừng giao dịch tự động';
            this.startAutoTrading();
        } else {
            startButton.textContent = 'Bắt đầu giao dịch tự động';
            this.stopAutoTrading();
        }
    }

    startAutoTrading() {
        this.autoTradeTimer = setInterval(() => {
            this.updateTradeLogic();
        }, 1000);
    }

    stopAutoTrading() {
        if (this.autoTradeTimer) {
            clearInterval(this.autoTradeTimer);
            this.autoTradeTimer = null;
        }
    }

    calculatePrices() {
        const basePrice = parseFloat(this.layout.querySelector('#basePrice').value);
        const marginPercentage = parseFloat(this.layout.querySelector('#marginPercentage').value);
        
        return {
            sellPrice: basePrice * (1 + marginPercentage / 100),
            buyPrice: basePrice * (1 - marginPercentage / 100)
        };
    }

    async updateTradeLogic() {
        // ... code từ hàm updateTradeLogic cũ ...
    }

    mount(container) {
        if (!container) {
            console.error('Container không tồn tại');
            return;
        }

        try {
            const layout = this.createLayout();
            container.appendChild(layout);
            console.log('Mounted Auto Trade successfully to', container.id);
        } catch (error) {
            console.error('Lỗi khi mount Auto Trade:', error);
        }
    }
}

const autoTradeManager = new AutoTradeManager();
export default autoTradeManager;
export { AutoTradeManager }; 