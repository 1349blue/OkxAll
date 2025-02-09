class LowTableManager {
    constructor() {
        this.conditions = [];
        this.layout = null;
        this.lowTableBody = null;
    }

    // Tạo và render layout
    createLayout() {
        const layout = document.createElement('div');
        layout.className = 'table-component';
        layout.id = 'layout4';
        layout.innerHTML = `
            <h2>Condition table: lệnh sell là bán hết token</h2>
            <button id="clearLowTable">Clear</button>
            <button id="addLowRow">Add</button>
            <button id="saveAsLowTable">Save as</button>
            <button id="loadLowTable">Load</button>
            <input type="file" id="fileInputLowTable" style="display: none;" accept="application/json">
            <label style="display: flex; align-items: center; gap: 5px;">
                <input type="checkbox" id="changeMin">
                thay đổi Target Price
            </label>
            <table id="LowTable">
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
                <tbody id="lowTableBody">
                </tbody>
            </table>
        `;

        // Lưu references
        this.layout = layout;
        this.lowTableBody = layout.querySelector('#lowTableBody');

        // Thêm event listeners
        this.setupEventListeners();

        return layout;
    }

    // Setup event listeners
    setupEventListeners() {
        const clearBtn = this.layout.querySelector('#clearLowTable');
        const addBtn = this.layout.querySelector('#addLowRow');
        const saveAsBtn = this.layout.querySelector('#saveAsLowTable');
        const loadBtn = this.layout.querySelector('#loadLowTable');
        const fileInput = this.layout.querySelector('#fileInputLowTable');
        const changeMinCheckbox = this.layout.querySelector('#changeMin');

        clearBtn.addEventListener('click', () => this.clearLowTable());
        addBtn.addEventListener('click', () => this.addLowRow());
        saveAsBtn.addEventListener('click', () => this.saveAsLowTable());
        loadBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                this.loadLowTable(event.target.files[0]);
            }
        });

        // Event delegation cho các nút Del và Act
        this.lowTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delLowRow')) {
                event.target.closest('tr').remove();
            }
        });
    }

    // Thêm 2 hàng mới vào bảng Low
    addLowRow() {
        const currentRows = this.lowTableBody.rows.length;
        const newOrder = Math.floor(currentRows / 2) + 1;

        // Tạo 2 hàng mới
        for (let i = 0; i < 2; i++) {
            const row = document.createElement("tr");
            
            // Define options for all select elements
            const options0 = ['market', 'limit'];
            const options1 = ['buy', 'sell'];
            const options2 = ['base_ccy', 'quote_ccy'];
            const logicOptions = ['>', '<', '='];

            // Create all select elements
            const select0 = this.createSelect(options0, 'market');
            const select1 = this.createSelect(options1, i === 0 ? 'buy' : 'sell');
            const select2 = this.createSelect(options2, 'base_ccy');
            const logicSelect = this.createSelect(logicOptions, '>');

            row.innerHTML = `
                <td contenteditable="true">${newOrder}</td>
                <td></td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">0</td>
                <td contenteditable="true">cash</td>
                <td></td>
                <td></td>
                <td contenteditable="true">0</td>
                <td></td>
                <td><button class="delLowRow">Del</button></td>
                <td><button class="actLow">Act</button></td>
            `;

            // Append all selects
            row.querySelector("td:nth-child(2)").appendChild(logicSelect);
            row.querySelector("td:nth-child(6)").appendChild(select1);
            row.querySelector("td:nth-child(7)").appendChild(select0);
            row.querySelector("td:nth-child(9)").appendChild(select2);

            this.lowTableBody.appendChild(row);
        }
    }

    // Xóa toàn bộ bảng Low
    clearLowTable() {
        this.lowTableBody.innerHTML = "";
    }

    // Lưu bảng Low thành file JSON
    saveAsLowTable() {
        try {
            const rows = Array.from(this.lowTableBody.rows);
            const lowData = rows.map(row => {
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

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lowData));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "low_table.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return true;
        } catch (err) {
            console.error("Error saving low table:", err);
            return false;
        }
    }

    // Load bảng Low từ file JSON
    loadLowTable(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const conditions = JSON.parse(event.target.result);
                        this.lowTableBody.innerHTML = ''; // Clear existing rows
                        
                        conditions.forEach(condition => {
                            const row = document.createElement('tr');
                            const select0 = this.createSelect(['market', 'limit'], condition.ordType);
                            const select1 = this.createSelect(['buy', 'sell'], condition.side);
                            const select2 = this.createSelect(['base_ccy', 'quote_ccy'], condition.tgtCcy);
                            const logicSelect = this.createSelect(['>', '<', '='], condition.logic);

                            row.innerHTML = `
                                <td contenteditable="true">${condition.order}</td>
                                <td></td>
                                <td contenteditable="true">${condition.targetPrice}</td>
                                <td contenteditable="true">${condition.percentage}</td>
                                <td contenteditable="true">${condition.tdMode}</td>
                                <td></td>
                                <td></td>
                                <td contenteditable="true">${condition.sz}</td>
                                <td></td>
                                <td><button class="delLowRow">Del</button></td>
                                <td><button class="actLow">Act</button></td>
                            `;

                            row.querySelector("td:nth-child(2)").appendChild(logicSelect);
                            row.querySelector("td:nth-child(6)").appendChild(select1);
                            row.querySelector("td:nth-child(7)").appendChild(select0);
                            row.querySelector("td:nth-child(9)").appendChild(select2);

                            this.lowTableBody.appendChild(row);
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
                console.error("Error loading low table:", err);
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
        if (!this.layout) {
            this.createLayout();
        }
        container.appendChild(this.layout);
    }
}

// Export instance mặc định
const lowTableManager = new LowTableManager();
export default lowTableManager;

// Export class nếu cần tạo nhiều instance
export { LowTableManager }; 