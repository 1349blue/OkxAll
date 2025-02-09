class OrderManager {
    constructor() {
        this.orders = [];
        this.layout = null;
        this.orderTableBody = null;
    }

    // Tạo và render layout
    createLayout() {
        if (this.layout) {
            return this.layout;
        }

        const layout = document.createElement('div');
        layout.className = 'table-component';
        layout.id = 'layout3';
        layout.innerHTML = `
            <h2>Order table</h2>
            <button id="clearOrderTable">Clear</button>
            <button id="addOrderRow">Add</button>
            <button id="saveAsOrderTable">Save as</button>
            <button id="loadOrderTable">Load</button>
            <input type="file" id="fileInputOrderTable" style="display: none;" accept="application/json">
            <table id="orderTable">
                <thead>
                    <tr>
                        <th>Order</th>
                        <th>Logic</th>
                        <th>Target Price</th>
                        <th>%</th>
                        <th>tdMode</th>
                        <th>Side</th>
                        <th>OrdType</th>
                        <th>Sz</th>
                        <th>tgtCcy</th>
                        <th>Del</th>
                        <th>Act</th>
                    </tr>
                </thead>
                <tbody id="orderTableBody">
                </tbody>
            </table>
        `;

        // Lưu references
        this.layout = layout;
        this.orderTableBody = layout.querySelector('#orderTableBody');

        // Thêm event listeners
        this.setupEventListeners();

        return layout;
    }

    // Setup event listeners
    setupEventListeners() {
        const clearBtn = this.layout.querySelector('#clearOrderTable');
        const addBtn = this.layout.querySelector('#addOrderRow');
        const saveAsBtn = this.layout.querySelector('#saveAsOrderTable');
        const loadBtn = this.layout.querySelector('#loadOrderTable');
        const fileInput = this.layout.querySelector('#fileInputOrderTable');

        clearBtn.addEventListener('click', () => this.clearOrderTable());
        addBtn.addEventListener('click', () => this.addOrderRow());
        saveAsBtn.addEventListener('click', () => this.saveAsOrderTable());
        loadBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                this.loadOrderTable(event.target.files[0]);
            }
        });

        // Event delegation cho các nút Del và Act
        this.orderTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delOrderRow')) {
                event.target.closest('tr').remove();
            }
            // Thêm xử lý cho nút Act nếu cần
        });
    }

    // Thêm hàng mới vào bảng Order
    addOrderRow() {
        const row = document.createElement("tr");

        // Define options for all select elements
        const options0 = ['market', 'limit'];
        const options1 = ['buy', 'sell'];
        const options2 = ['base_ccy', 'quote_ccy'];
        const logicOptions = ['>', '<', '='];

        // Create all select elements
        const select0 = document.createElement("select");
        const select1 = document.createElement("select");
        const select2 = document.createElement("select");
        const logicSelect = document.createElement("select");

        // Populate all selects
        [
            { select: select0, options: options0 },
            { select: select1, options: options1 },
            { select: select2, options: options2 },
            { select: logicSelect, options: logicOptions }
        ].forEach(({ select, options }) => {
            options.forEach(option => {
                const opt = document.createElement("option");
                opt.value = option;
                opt.textContent = option;
                select.appendChild(opt);
            });
        });

        // Set default values
        select0.value = 'market';
        select1.value = 'buy';
        select2.value = 'base_ccy';
        logicSelect.value = '>';

        row.innerHTML = `
            <td contenteditable="true">0</td>
            <td></td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">cash</td>
            <td></td>
            <td></td>
            <td contenteditable="true">0</td>
            <td></td>
            <td><button class="delOrderRow">Del</button></td>
            <td><button class="actOrder">Act</button></td>
        `;

        // Append all selects
        row.querySelector("td:nth-child(2)").appendChild(logicSelect);
        row.querySelector("td:nth-child(6)").appendChild(select1);
        row.querySelector("td:nth-child(7)").appendChild(select0);
        row.querySelector("td:nth-child(9)").appendChild(select2);

        this.orderTableBody.appendChild(row);
    }

    // Xóa toàn bộ bảng Order
    clearOrderTable() {
        this.orderTableBody.innerHTML = "";
    }

    // Lưu bảng Order thành file JSON
    saveAsOrderTable() {
        try {
            const rows = Array.from(this.orderTableBody.rows);
            const orderData = rows.map(row => {
                return {
                    order: parseInt(row.cells[0].textContent) || 0,
                    logic: row.cells[1].querySelector('select').value,
                    targetPrice: parseFloat(row.cells[2].textContent) || 0,
                    percentage: parseFloat(row.cells[3].textContent) || 0,
                    tdMode: row.cells[4].textContent || '',
                    side: row.cells[5].querySelector('select').value,
                    ordType: row.cells[6].querySelector('select').value,
                    sz: parseFloat(row.cells[7].textContent) || 0,
                    tgtCcy: row.cells[8].querySelector('select').value
                };
            });

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orderData));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "order_table.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return true;
        } catch (err) {
            console.error("Error saving order table:", err);
            return false;
        }
    }

    // Load bảng Order từ file JSON
    loadOrderTable(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const orders = JSON.parse(event.target.result);
                        this.orderTableBody.innerHTML = ''; // Clear existing rows
                        
                        orders.forEach(order => {
                            const row = document.createElement('tr');
                            const select0 = this.createSelect(['market', 'limit'], order.ordType);
                            const select1 = this.createSelect(['buy', 'sell'], order.side);
                            const select2 = this.createSelect(['base_ccy', 'quote_ccy'], order.tgtCcy);
                            const logicSelect = this.createSelect(['>', '<', '='], order.logic);

                            row.innerHTML = `
                                <td contenteditable="true">${order.order}</td>
                                <td></td>
                                <td contenteditable="true">${order.targetPrice}</td>
                                <td contenteditable="true">${order.percentage}</td>
                                <td contenteditable="true">${order.tdMode}</td>
                                <td></td>
                                <td></td>
                                <td contenteditable="true">${order.sz}</td>
                                <td></td>
                                <td><button class="delOrderRow">Del</button></td>
                                <td><button class="actOrder">Act</button></td>
                            `;

                            row.querySelector("td:nth-child(2)").appendChild(logicSelect);
                            row.querySelector("td:nth-child(6)").appendChild(select1);
                            row.querySelector("td:nth-child(7)").appendChild(select0);
                            row.querySelector("td:nth-child(9)").appendChild(select2);

                            this.orderTableBody.appendChild(row);
                        });
                        resolve(true);
                    } catch (err) {
                        console.error("Error parsing file:", err);
                        reject(err);
                    }
                }.bind(this);
                reader.onerror = function() {
                    reject(new Error("Error reading file"));
                };
                reader.readAsText(file);
            } catch (err) {
                console.error("Error loading order table:", err);
                reject(err);
            }
        });
    }

    // Helper method để tạo select element
    createSelect(options, selectedValue) {
        const select = document.createElement("select");
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            opt.selected = option === selectedValue;
            select.appendChild(opt);
        });
        return select;
    }

    // Phương thức để mount component vào container
    mount(container) {
        if (!container) {
            console.error('Container không tồn tại');
            return;
        }

        try {
            const layout = this.createLayout();
            container.appendChild(layout);
            console.log('Mounted successfully to', container.id);
        } catch (error) {
            console.error('Lỗi khi mount:', error);
        }
    }
}

// Export instance mặc định
const orderManager = new OrderManager();
export default orderManager;

// Export class nếu cần tạo nhiều instance
export { OrderManager }; 