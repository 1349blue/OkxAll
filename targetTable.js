class TargetTableManager {
    constructor() {
        this.targets = [];
        this.layout = null;
        this.targetTableBody = null;
    }

    // Tạo và render layout
    createLayout() {
        const layout = document.createElement('div');
        layout.className = 'table-component';
        layout.id = 'layout5';
        layout.innerHTML = `
            <h2>Target table</h2>
            <button id="clearTargetTable">Clear</button>
            <button id="addTargetRow">Add</button>
            <button id="saveAsTargetTable">Save as</button>
            <button id="loadTargetTable">Load</button>
            <input type="file" id="fileInputTargetTable" style="display: none;" accept="application/json">
            <table id="targetTable">
                <thead>
                    <tr>
                        <th>Table</th>
                        <th>Row</th>
                        <th>Order Change</th>
                        <th>TokenName</th>
                        <th>Current Price</th>
                        <th>Logic</th>
                        <th>Target Price</th>
                        <th>Del</th>
                    </tr>
                </thead>
                <tbody id="targetTableBody">
                </tbody>
            </table>
        `;

        // Lưu references
        this.layout = layout;
        this.targetTableBody = layout.querySelector('#targetTableBody');

        // Thêm event listeners
        this.setupEventListeners();

        return layout;
    }

    // Setup event listeners
    setupEventListeners() {
        const clearBtn = this.layout.querySelector('#clearTargetTable');
        const addBtn = this.layout.querySelector('#addTargetRow');
        const saveAsBtn = this.layout.querySelector('#saveAsTargetTable');
        const loadBtn = this.layout.querySelector('#loadTargetTable');
        const fileInput = this.layout.querySelector('#fileInputTargetTable');

        clearBtn.addEventListener('click', () => this.clearTargetTable());
        addBtn.addEventListener('click', () => this.addTargetRow());
        saveAsBtn.addEventListener('click', () => this.saveAsTargetTable());
        loadBtn.addEventListener('click', () => {
            fileInput.value = '';
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            if (event.target.files.length > 0) {
                this.loadTargetTable(event.target.files[0]);
            }
        });

        // Event delegation cho nút Del
        this.targetTableBody.addEventListener('click', (event) => {
            if (event.target.classList.contains('delTargetRow')) {
                event.target.closest('tr').remove();
            }
        });
    }

    // Thêm hàng mới vào bảng Target
    addTargetRow() {
        const row = document.createElement("tr");
        
        // Define options for select elements
        const tableOptions = ['Order', 'Low'];
        const logicOptions = ['>', '<', '='];

        // Create select elements
        const tableSelect = this.createSelect(tableOptions, 'Order');
        const logicSelect = this.createSelect(logicOptions, '>');

        row.innerHTML = `
            <td></td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true"></td>
            <td contenteditable="true">0</td>
            <td></td>
            <td contenteditable="true">0</td>
            <td><button class="delTargetRow">Del</button></td>
        `;

        // Append selects
        row.querySelector("td:nth-child(1)").appendChild(tableSelect);
        row.querySelector("td:nth-child(6)").appendChild(logicSelect);

        this.targetTableBody.appendChild(row);
    }

    // Xóa toàn bộ bảng Target
    clearTargetTable() {
        this.targetTableBody.innerHTML = "";
    }

    // Lưu bảng Target thành file JSON
    saveAsTargetTable() {
        try {
            const rows = Array.from(this.targetTableBody.rows);
            const targetData = rows.map(row => {
                return {
                    table: row.cells[0].querySelector('select').value,
                    row: parseInt(row.cells[1].textContent) || 0,
                    orderChange: parseInt(row.cells[2].textContent) || 0,
                    tokenName: row.cells[3].textContent,
                    currentPrice: parseFloat(row.cells[4].textContent) || 0,
                    logic: row.cells[5].querySelector('select').value,
                    targetPrice: parseFloat(row.cells[6].textContent) || 0
                };
            });

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetData));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "target_table.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            return true;
        } catch (err) {
            console.error("Error saving target table:", err);
            return false;
        }
    }

    // Load bảng Target từ file JSON
    loadTargetTable(file) {
        return new Promise((resolve, reject) => {
            try {
                const reader = new FileReader();
                reader.onload = function(event) {
                    try {
                        const targets = JSON.parse(event.target.result);
                        this.targetTableBody.innerHTML = ''; // Clear existing rows
                        
                        targets.forEach(target => {
                            const row = document.createElement('tr');
                            const tableSelect = this.createSelect(['Order', 'Low'], target.table);
                            const logicSelect = this.createSelect(['>', '<', '='], target.logic);

                            row.innerHTML = `
                                <td></td>
                                <td contenteditable="true">${target.row}</td>
                                <td contenteditable="true">${target.orderChange}</td>
                                <td contenteditable="true">${target.tokenName}</td>
                                <td contenteditable="true">${target.currentPrice}</td>
                                <td></td>
                                <td contenteditable="true">${target.targetPrice}</td>
                                <td><button class="delTargetRow">Del</button></td>
                            `;

                            row.querySelector("td:nth-child(1)").appendChild(tableSelect);
                            row.querySelector("td:nth-child(6)").appendChild(logicSelect);

                            this.targetTableBody.appendChild(row);
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
                console.error("Error loading target table:", err);
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
const targetTableManager = new TargetTableManager();
export default targetTableManager;

// Export class nếu cần tạo nhiều instance
export { TargetTableManager }; 