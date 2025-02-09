import OKXApi from './okxApi.js';
import support from './suport.js';
import orderManager from './order.js';
import lowTableManager from './lowTable.js';
import targetTableManager from './targetTable.js';

// Khởi tạo biến global cho OKX API
let okxApi = null;

document.addEventListener("DOMContentLoaded", function() {
	console.log('DOM loaded');
	
	const containers = {
		order: document.getElementById('order-table-container'),
		low: document.getElementById('low-table-container'),
		target: document.getElementById('target-table-container')
	};

	// Log để kiểm tra containers
	console.log('Containers:', containers);

	// Kiểm tra các managers
	console.log('OrderManager:', orderManager);
	console.log('LowTableManager:', lowTableManager);
	console.log('TargetTableManager:', targetTableManager);

	// Mount với try-catch
	Object.entries(containers).forEach(([name, container]) => {
		if (!container) {
			console.error(`Container ${name} không tồn tại`);
			return;
		}

		try {
			switch(name) {
				case 'order':
					orderManager.mount(container);
					break;
				case 'low':
					lowTableManager.mount(container);
					break;
				case 'target':
					targetTableManager.mount(container);
					break;
			}
			console.log(`Mounted ${name} successfully`);
		} catch (error) {
			console.error(`Lỗi khi mount ${name}:`, error);
		}
	});

	/*
	//đăng ký Service Worker:
	if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registered with scope:', registration.scope);
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
	}
	*/
    const apiKeyInput = document.getElementById("apiKey");
    const secretKeyInput = document.getElementById("secretKey");
    const passphraseInput = document.getElementById("passphrase");
    const tokenNameInput = document.getElementById("tokenName");
    const tokenPriceSpan = document.getElementById("tokenPrice");

    const saveApiKeyButton = document.getElementById("saveApiKey");
    const saveAsApiKeyButton = document.getElementById("saveAsApiKey");
    const loadApiKeyButton = document.getElementById("loadApiKey");
    const fileInput = document.getElementById("fileInput");

    const clearOrderTableButton = document.getElementById("clearOrderTable");
    const addOrderRowButton = document.getElementById("addOrderRow");
    const saveAsOrderTableButton = document.getElementById("saveAsOrderTable");
    const loadOrderTableInput = document.getElementById("loadOrderTable");

    const clearLowTableButton = document.getElementById("clearLowTable");
    const addLowRowButton = document.getElementById("addLowRow");
    const saveAsLowTableButton = document.getElementById("saveAsLowTable");
    const loadLowTableInput = document.getElementById("loadLowTable");

    const clearTargetTableButton = document.getElementById("clearTargetTable");
    const addTargetRowButton = document.getElementById("addTargetRow");
    const saveAsTargetTableButton = document.getElementById("saveAsTargetTable");
    const loadTargetTableInput = document.getElementById("loadTargetTable");

    const loadOrderTableButton = document.getElementById("loadOrderTable");
    const fileInputOrderTable = document.getElementById("fileInputOrderTable");
    
    const loadLowTableButton = document.getElementById("loadLowTable");
    const fileInputLowTable = document.getElementById("fileInputLowTable");
    
    const loadTargetTableButton = document.getElementById("loadTargetTable");
    const fileInputTargetTable = document.getElementById("fileInputTargetTable");

	let tokenName = '';
    let varTokenPrice = 0;
    let orders = [];
    let conditions = [];
	let updateInterval = 1000; // Default interval

    // Thêm biến toàn cục để theo dõi trạng thái của toggle
    let isTradeEnabled = false;
	let priceUpdateTimer = null;
    // Thêm hàm để bắt đầu/dừng vòng lặp
    function toggleTrading() {
        isTradeEnabled = tradingCheckbox.checked; // Cập nhật trạng thái từ checkbox
        
        if (isTradeEnabled) {
            // Bắt đầu vòng lặp khi enabled = true
            updateTokenPrice();
            priceUpdateTimer = setInterval(() => {
                updateTokenPrice();
                checkConditions(); 
            }, updateInterval);
            support.showAlert("Trading enabled");
        } else {
            // Dừng vòng lặp khi enabled = false 
            if (priceUpdateTimer) {
                clearInterval(priceUpdateTimer);
                priceUpdateTimer = null;
            }
            varTokenPrice = 0;
            tokenPriceSpan.textContent = varTokenPrice.toFixed(8);
            support.showAlert("Trading disabled");
        }
    }

    // Thêm event listener cho checkbox
    const tradingCheckbox = document.getElementById("toggleSwitch");
    tradingCheckbox.addEventListener("change", (e) => {
        toggleTrading();
    });

    // Save API keys to global variables
    saveApiKeyButton.addEventListener("click", () => {
        okxApi.saveApiKey(apiKeyInput, secretKeyInput, passphraseInput);
    });

    // Save API keys to JSON file
    saveAsApiKeyButton.addEventListener("click", () => {
        okxApi.saveAsApiKey(apiKeyInput, secretKeyInput, passphraseInput);
    });

    // Load API keys from JSON file
    loadApiKeyButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", event => {
        okxApi.loadApiKey(event.target.files[0], apiKeyInput, secretKeyInput, passphraseInput);
    });

    // Fetch and update token price
	async function updateTokenPrice() {
		try {
			if (!okxApi) {
				support.showAlert("Vui lòng nhập API keys trước");
				return;
			}

			tokenName = tokenNameInput.value.trim().toUpperCase();
			if (!tokenName) {
				support.showAlert("Vui lòng nhập tên token hợp lệ");
				return;
			}

			varTokenPrice = await okxApi.getTokenPrice(tokenName);
			tokenPriceSpan.textContent = varTokenPrice.toFixed(8);
		} catch (error) {
			console.warn(`Lỗi khi lấy giá từ OKX:`, error.message);
			support.showAlert("Không thể lấy giá token từ OKX");
		}
	}

    // Add row to condition table
    function addLowRow() {
        const lowTableBody = document.querySelector("#LowTable tbody");
        const currentRows = lowTableBody.rows.length;
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
            logicSelect.value = i === 0 ? '<' : '>';  // Set logic based on row index

            row.innerHTML = `
                <td contenteditable="true">${-newOrder}</td>
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

            lowTableBody.appendChild(row);
        }
    }

    // Clear condition table
    function clearLowTable() {
        const lowTableBody = document.querySelector("#LowTable tbody");
        lowTableBody.innerHTML = "";
    }

    // Save condition table to JSON file
	function saveAsLowTable() {
		const lowTableBody = document.querySelector("#LowTable tbody");
		const rows = Array.from(lowTableBody.rows);
		const lowData = rows.map(row => {
			return {
				order: parseInt(row.cells[0].textContent),
				logic: row.cells[1].textContent,
				targetPrice: parseFloat(row.cells[2].textContent),
				percentage: parseFloat(row.cells[3].textContent),
				tdMode: row.cells[4].textContent,
				side: row.cells[5].querySelector('select').value,
				ordType: row.cells[6].querySelector('select').value,
				sz: row.cells[7].textContent,
				tgtCcy: row.cells[8].querySelector('select').value
			};
		});
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lowData));
		const downloadAnchorNode = document.createElement('a');
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", "conditions.json");
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}
    // Save condition table to JSON file with better formatting and error handling
    function saveAsLowTable() {
        try {
            const lowTableBody = document.querySelector("#LowTable tbody");
            if (!lowTableBody) {
                throw new Error("Low table body not found");
            }

            const rows = Array.from(lowTableBody.rows);
            const lowData = rows.map(row => {
                return {
                    order: parseInt(row.cells[0].textContent) || 0,
                    logic: row.cells[1].querySelector('select')?.value || '',
                    targetPrice: parseFloat(row.cells[2].textContent) || 0, 
                    percentage: parseFloat(row.cells[3].textContent) || 0,
                    tdMode: row.cells[4].textContent || '',
                    side: row.cells[5].querySelector('select')?.value || '',
                    ordType: row.cells[6].querySelector('select')?.value || '',
                    sz: row.cells[7].textContent || '0',
                    tgtCcy: row.cells[8].querySelector('select')?.value || ''
                };
            });

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(lowData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "conditions.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            support.showAlert("Low table saved successfully");
        } catch (err) {
            console.error("Error saving low table:", err);
            support.showAlert("Error saving low table");
        }
    }

    // Load condition table from JSON file
	function loadLowTable(file) {
		const reader = new FileReader();
		reader.onload = function(event) {
			try {
				const data = JSON.parse(event.target.result);
				const lowTableBody = document.querySelector("#LowTable tbody");
				lowTableBody.innerHTML = "";
				
				data.forEach(condition => {
					const row = document.createElement("tr");
					
					// Create all select elements
					const sideSelect = document.createElement("select");
					const ordTypeSelect = document.createElement("select");
					const tgtCcySelect = document.createElement("select");
					const logicSelect = document.createElement("select");

					// Add options for logic
					['>', '<', '='].forEach(option => {
						const opt = document.createElement("option");
						opt.value = option;
						opt.textContent = option;
						opt.selected = condition.logic === option;
						logicSelect.appendChild(opt);
					});

					// Add options for other selects
					sideSelect.innerHTML = `
						<option value="buy" ${condition.side === 'buy' ? 'selected' : ''}>buy</option>
						<option value="sell" ${condition.side === 'sell' ? 'selected' : ''}>sell</option>
					`;
					ordTypeSelect.innerHTML = `
						<option value="market" ${condition.ordType === 'market' ? 'selected' : ''}>market</option>
						<option value="limit" ${condition.ordType === 'limit' ? 'selected' : ''}>limit</option>
					`;
					tgtCcySelect.innerHTML = `
						<option value="base_ccy" ${condition.tgtCcy === 'base_ccy' ? 'selected' : ''}>base_ccy</option>
						<option value="quote_ccy" ${condition.tgtCcy === 'quote_ccy' ? 'selected' : ''}>quote_ccy</option>
					`;

					row.innerHTML = `
						<td contenteditable="true">${condition.order || 0}</td>
						<td></td>
						<td contenteditable="true">${condition.targetPrice || 0}</td>
						<td contenteditable="true">${condition.percentage || 0}</td>
						<td contenteditable="true">${condition.tdMode || 'cash'}</td>
						<td></td>
						<td></td>
						<td contenteditable="true">${condition.sz || 0}</td>
						<td></td>
						<td><button class="delLowRow">Del</button></td>
						<td><button class="actLow">Act</button></td>
					`;

					// Append all selects
					row.querySelector("td:nth-child(2)").appendChild(logicSelect);
					row.querySelector("td:nth-child(6)").appendChild(sideSelect);
					row.querySelector("td:nth-child(7)").appendChild(ordTypeSelect);
					row.querySelector("td:nth-child(9)").appendChild(tgtCcySelect);

					lowTableBody.appendChild(row);
				});
				support.showAlert("Low table loaded successfully");
			} catch (err) {
				console.error("Error loading low table:", err);
				support.showAlert("Error loading low table: " + err.message);
			}
		};
		reader.onerror = function() {
			support.showAlert("Error reading file");
		};
		reader.readAsText(file);
	}

    // Evaluate conditions and execute actions
    async function checkConditions() {
        // Thêm kiểm tra target table trước
        const targetTableBody = document.querySelector("#targetTable tbody");
        const targetRows = Array.from(targetTableBody.rows);
        
        for (const targetRow of targetRows) {
            const selectedTable = targetRow.cells[0].querySelector('select').value;
            const rowNumber = parseInt(targetRow.cells[1].textContent);
            const orderChange = parseInt(targetRow.cells[2].textContent);
            const tokenNameTarget = targetRow.cells[3].textContent;
            const logic = targetRow.cells[5].querySelector('select').value;
            const targetPrice = parseFloat(targetRow.cells[6].textContent);

            // Cập nhật current price trong target table
            const url = `https://www.okx.com/api/v5/market/ticker?instId=${tokenNameTarget}-USDT`;
            fetch(url)
                .then(response => response.json())
                .then(data => {
                    const currentPrice = parseFloat(data.data[0].last);
                    targetRow.cells[4].textContent = currentPrice.toFixed(8);
                    
                    // Kiểm tra điều kiện logic sau khi có giá
                    if (evaluateCondition(logic, targetPrice, currentPrice)) {
                        // Tìm và cập nhật order trong bảng tương ứng
                        const tableToUpdate = selectedTable === 'Order Table' ? 
                            document.getElementById("orderTableBody") : 
                            document.querySelector("#LowTable tbody");

                        const rowToUpdate = Array.from(tableToUpdate.rows)[rowNumber - 1];
                        if (rowToUpdate) {
                            const currentOrder = parseInt(rowToUpdate.cells[0].textContent);
							Array.from(tableToUpdate.rows).forEach(row => {
								row.cells[2].textContent = varTokenPrice;
							});
                            rowToUpdate.cells[0].textContent = orderChange;
                            support.showAlert(`Updated order in ${selectedTable} row ${rowNumber} to ${orderChange}`);
                            targetRow.cells[1].textContent = -rowNumber; // Gán rowNumber về -rowNumber sau khi thực hiện xong
                        }
                    }
                })
                .catch(error => support.showAlert("Error fetching token price: " + error.message));
        }

        // Kiểm tra Order Table
        const orderTableBody = document.getElementById("orderTableBody");
        const orderRows = Array.from(orderTableBody.rows);
        orderRows.forEach(row => {
            const order = parseInt(row.cells[0].textContent);
            const logic = row.cells[1].querySelector('select').value;
            const targetPrice = parseFloat(row.cells[2].textContent);
            const percentageValue = parseFloat(row.cells[3].textContent) / 100;
            const realPrice = targetPrice * (1 + percentageValue);
            
            if (order > 0 && evaluateCondition(logic, realPrice, varTokenPrice)) {
                executeOrder({
                    apiKey: apiKeyInput.value,
                    secretKey: secretKeyInput.value,
                    passphrase: passphraseInput.value,
                    tdMode: row.cells[4].textContent,
                    side: row.cells[5].querySelector('select').value,
                    ordType: row.cells[6].querySelector('select').value,
                    sz: row.cells[7].textContent,
                    tgtCcy: row.cells[8].querySelector('select').value
                });
                updateOrderStatus(row, orderTableBody);
            }
        });

        // Kiểm tra Low Table
        const lowTableBody = document.querySelector("#LowTable tbody");
        const lowRows = Array.from(lowTableBody.rows);
        
        for (const row of lowRows) {
            const order = parseInt(row.cells[0].textContent);
            const logic = row.cells[1].querySelector('select').value;
            const targetPrice = parseFloat(row.cells[2].textContent);
            const percentageValue = parseFloat(row.cells[3].textContent) / 100;
            const realPrice = targetPrice * (1 + percentageValue);
            
            if (order > 0 && evaluateCondition(logic, realPrice, varTokenPrice)) {
				support.thongBaoTaget();
				if (row.cells[5].querySelector('select').value === 'sell') {
					try {
						const balance = await getTokenBalance();
						if (balance > 0) {
							executeOrder({
								apiKey: apiKeyInput.value,
								secretKey: secretKeyInput.value,
								passphrase: passphraseInput.value,
								tdMode: row.cells[4].textContent,
								side: row.cells[5].querySelector('select').value,
								ordType: row.cells[6].querySelector('select').value,
								sz: balance,
								tgtCcy: row.cells[8].querySelector('select').value
							});
							
						} else {
							console.error("Số dư không đủ để thực hiện lệnh bán!");
						}
					} catch (error) {
						console.error("Lỗi khi lấy số dư:", error);
					}
				} else {
					
					executeOrder({
						apiKey: apiKeyInput.value,
						secretKey: secretKeyInput.value,
						passphrase: passphraseInput.value,
						tdMode: row.cells[4].textContent,
						side: row.cells[5].querySelector('select').value,
						ordType: row.cells[6].querySelector('select').value,
						sz: row.cells[7].textContent,
						tgtCcy: row.cells[8].querySelector('select').value
					});
					
				}
				console.log('Checking order execution...');
				support.showAlert('Order condition met - executing order');
                updateOrderStatus(row,lowTableBody);
            }
			
            if (document.getElementById('changeMin').checked && varTokenPrice < targetPrice) {
                updateTargetPrice(row);
            }
			
        };
    }
	function updateOrderStatus(row, TableBody) {
        try {
            // Kiểm tra tham số đầu vào
            if (!row || !TableBody) {
                console.error("Missing parameters:", { row, TableBody });
                return;
            }

            // Debug thông tin row
            console.log("Current row:", {
                rowContent: row.innerHTML,
                firstCell: row.cells[0]?.textContent
            });

            // Lấy và kiểm tra order value
            const order = parseInt(row.cells[0]?.textContent);
            if (isNaN(order)) {
                console.error("Invalid order value:", row.cells[0]?.textContent);
                return;
            }
            console.log("Processing order:", order);

            // Kiểm tra TableBody
            if (!TableBody.rows) {
                console.error("Invalid TableBody:", TableBody);
                return;
            }

            // Tìm các hàng có order ngược dấu
            const opposingOrders = Array.from(TableBody.rows).filter(r => {
                if (!r.cells[0]) {
                    console.warn("Row missing first cell:", r);
                    return false;
                }
                const opposingOrder = parseInt(r.cells[0].textContent);
                const isOpposing = !isNaN(opposingOrder) && opposingOrder === -order;
                if (isOpposing) {
                    console.log("Found opposing order:", opposingOrder);
                }
                return isOpposing;
            });

            // Cập nhật các order ngược dấu
            opposingOrders.forEach(r => {
                try {
                    const currentOrder = parseInt(r.cells[0].textContent);
                    const newValue = Math.abs(currentOrder);
                    r.cells[0].textContent = newValue; // Sử dụng textContent thay vì innerHTML
                    console.log("Updated opposing order:", {
                        from: currentOrder,
                        to: newValue,
                        cell: r.cells[0]
                    });
                } catch (err) {
                    console.error("Error updating opposing order:", err);
                }
            });

            // Cập nhật order hiện tại
            const newValue = -order;
            row.cells[0].textContent = newValue; // Sử dụng textContent thay vì innerHTML
            console.log("Updated current order:", {
                from: order,
                to: newValue,
                cell: row.cells[0]
            });

            // Thông báo hoàn thành
            support.showAlert("Orders updated successfully");

        } catch (err) {
            console.error("Error in updateOrderStatus:", err);
            support.showAlert("Error updating orders: " + err.message);
        }
    }

    function updateTargetPrice(row) {
        row.cells[2].textContent = varTokenPrice;
    }

    function evaluateCondition(logic, targetPrice, currentPrice) {
        switch (logic) {
            case ">":
                return currentPrice > targetPrice;
            case "<":
                return currentPrice < targetPrice;
            case "=":
                return currentPrice === targetPrice;
            default:
                console.error("Invalid logic operator:", logic);
                return false;
        }
    }
    /*
    async function executeOrder(order) {
        const timestamp = new Date().toISOString();
        addToHistory({
            timestamp: new Date().toLocaleString(),
            type: order.side,
            price: varTokenPrice,
            amount: order.sz,
            token: tokenName,
            status: 'Thành công'
        });
    }
    */
    async function executeOrder(orderParams) {
        try {
            if (!okxApi) {
                throw new Error("API chưa được khởi tạo");
            }

            const result = await okxApi.executeOrder({
                token: tokenName,
                ...orderParams
            });

            addToHistory({
                timestamp: new Date().toLocaleString(),
                type: orderParams.side,
                price: varTokenPrice,
                amount: orderParams.sz,
                token: tokenName,
                status: 'Thành công'
            });

            support.showAlert('Order executed successfully');
            support.thongBaoTaget();
        } catch (error) {
            addToHistory({
                timestamp: new Date().toLocaleString(),
                type: orderParams.side,
                price: varTokenPrice,
                amount: orderParams.sz,
                token: tokenName,
                status: 'Lỗi: ' + error.message
            });
            
            support.showAlert('Error executing order: ' + error.message);
        }
    }

    async function getTokenBalance() {
        try {
            if (!okxApi) {
                throw new Error("API chưa được khởi tạo");
            }
            return await okxApi.getTokenBalance(tokenName);
        } catch (error) {
            console.error("Lỗi khi lấy số dư:", error);
            throw error;
        }
    }

    // Thêm hàm mới để xử lý lịch sử
    function addToHistory(orderInfo) {
        const historyDiv = document.getElementById('orderHistory');
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            ${orderInfo.timestamp} - 
            ${orderInfo.type.toUpperCase()} ${orderInfo.amount} ${orderInfo.token} 
            @ ${orderInfo.price} USDT - 
            ${orderInfo.status}
        `;
        historyDiv.insertBefore(historyItem, historyDiv.firstChild);
    }

    // Thêm các event listener cho nút điều khiển lịch sử
    document.getElementById('clearHistory').addEventListener('click', () => {
        document.getElementById('orderHistory').innerHTML = '';
    });

    document.getElementById('saveHistory').addEventListener('click', () => {
        const historyDiv = document.getElementById('orderHistory');
        const historyText = Array.from(historyDiv.children)
            .map(item => item.textContent.trim())
            .join('\n');
        
        const blob = new Blob([historyText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trading_history_${new Date().toISOString().slice(0,10)}.txt`;
        a.click();
        window.URL.revokeObjectURL(url);
    });

    // Add event listeners
    saveApiKeyButton.addEventListener("click", () => {
        okxApi.saveApiKey(apiKeyInput, secretKeyInput, passphraseInput);
    });
    saveAsApiKeyButton.addEventListener("click", () => {
        okxApi.saveAsApiKey(apiKeyInput, secretKeyInput, passphraseInput);
    });
    loadApiKeyButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", event => {
        okxApi.loadApiKey(event.target.files[0], apiKeyInput, secretKeyInput, passphraseInput);
    });

    clearOrderTableButton.addEventListener("click", () => {
        orderManager.clearOrderTable(document.getElementById("orderTableBody"));
    });
    addOrderRowButton.addEventListener("click", () => {
        orderManager.addOrderRow(document.getElementById("orderTableBody"));
    });
    saveAsOrderTableButton.addEventListener("click", () => {
        if (orderManager.saveAsOrderTable(document.getElementById("orderTableBody"))) {
            support.showAlert("Order table saved successfully");
        } else {
            support.showAlert("Error saving order table");
        }
    });
    loadOrderTableInput.addEventListener("change", event => {
        if (event.target.files.length > 0) {
            orderManager.loadOrderTable(event.target.files[0], document.getElementById("orderTableBody"))
                .then(() => support.showAlert("Order table loaded successfully"))
                .catch(error => support.showAlert("Error loading order table: " + error.message));
        }
    });

    clearLowTableButton.addEventListener("click", clearLowTable);
    addLowRowButton.addEventListener("click", addLowRow);
    saveAsLowTableButton.addEventListener("click", saveAsLowTable);
    loadLowTableInput.addEventListener("change", event => loadLowTable(event.target.files[0]));

    
    const intervalInput = document.getElementById("updateInterval");
    const saveIntervalButton = document.getElementById("saveInterval");

    saveIntervalButton.addEventListener("click", () => {
        const newInterval = parseInt(intervalInput.value);
        if (!isNaN(newInterval) && newInterval > 0) {
            updateInterval = newInterval;
            
            clearInterval(priceUpdateTimer);
            priceUpdateTimer = setInterval(() => {
                updateTokenPrice();
                checkConditions();
            }, updateInterval);
            
            support.showAlert("Update interval changed to " + newInterval + "ms");
        } else {
            support.showAlert("Please enter a valid interval");
        }
    });

    
	
	// thông báo
	function showAlert(message) {
            const alertBox = document.createElement('div');
            alertBox.className = 'custom-alert';
            alertBox.textContent = message;
            document.body.appendChild(alertBox);

            // Hiển thị alert
            alertBox.style.display = 'block';
			support.thongBaoTaget();

            // Tự động ẩn sau 1 giây
            setTimeout(() => {
                alertBox.style.display = 'none';
                alertBox.remove(); // Xóa phần tử khỏi DOM
            }, 2000);
        }

    // Event delegation for dynamically created rows
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("delOrderRow")) {
            event.target.closest("tr").remove();
        } else if (event.target.classList.contains("actOrder")) {
            const row = event.target.closest("tr");
            executeOrder({
                    apiKey: apiKeyInput.value,
                    secretKey: secretKeyInput.value,
                    passphrase: passphraseInput.value,
                    tdMode: row.cells[4].textContent,
                    side: row.cells[5].querySelector('select').value,
                    ordType: row.cells[6].querySelector('select').value,
                    sz: row.cells[7].textContent,
                    tgtCcy: row.cells[8].querySelector('select').value
            });
        } else if (event.target.classList.contains("delLowRow")) {
            event.target.closest("tr").remove();
        } else if (event.target.classList.contains("actLow")) {
            const row = event.target.closest("tr");
            executeOrder({
					apiKey: apiKeyInput.value,
                    secretKey: secretKeyInput.value,
                    passphrase: passphraseInput.value,
                    tdMode: row.cells[4].textContent,
                    side: row.cells[5].querySelector('select').value,
                    ordType: row.cells[6].querySelector('select').value,
                    sz: row.cells[7].textContent,
                    tgtCcy: row.cells[8].querySelector('select').value
            });
        }
    });

    // Thêm event listener cho toggleSwitch
    const toggleSwitch = document.getElementById("toggleSwitch");
    toggleSwitch.addEventListener("change", function() {
        isTradeEnabled = this.checked;
        support.showAlert(isTradeEnabled ? "Trading enabled" : "Trading disabled");
    });

    // Thêm hàm xử lý cho Target table
    function addTargetRow() {
        const targetTableBody = document.querySelector("#targetTable tbody");
        const row = document.createElement("tr");

        // Tạo select cho cột Table
        const tableSelect = document.createElement("select");
        const tableOptions = ['Order Table', 'Low Table'];
        tableOptions.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            tableSelect.appendChild(opt);
        });

        // Tạo select cho cột Logic
        const logicSelect = document.createElement("select");
        const logicOptions = ['>', '<', '='];
        logicOptions.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            logicSelect.appendChild(opt);
        });

        row.innerHTML = `
            <td></td>
            <td contenteditable="true">-1</td>
            <td contenteditable="true">0</td>
            <td contenteditable="true">BTC</td>
            <td>${varTokenPrice || '0'}</td>
            <td></td>
            <td contenteditable="true">0</td>
            <td><button class="delTargetRow">Del</button></td>
        `;

        // Thêm các select vào các cột tương ứng
        row.querySelector("td:nth-child(1)").appendChild(tableSelect);
        row.querySelector("td:nth-child(6)").appendChild(logicSelect);

        targetTableBody.appendChild(row);
    }

    function clearTargetTable() {
        const targetTableBody = document.querySelector("#targetTable tbody");
        targetTableBody.innerHTML = "";
    }

    function saveAsTargetTable() {
        const targetTableBody = document.querySelector("#targetTable tbody");
        const rows = Array.from(targetTableBody.rows);
        const targetData = rows.map(row => {
            return {
                table: row.cells[0].querySelector('select').value,
                row: parseInt(row.cells[1].textContent),
                orderChange: parseInt(row.cells[2].textContent),
                tokenName: row.cells[3].textContent,
                currentPrice: parseFloat(row.cells[4].textContent),
                logic: row.cells[5].querySelector('select').value,
                targetPrice: parseFloat(row.cells[6].textContent)
            };
        });

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "targets.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    function loadTargetTable(file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const data = JSON.parse(event.target.result);
            const targetTableBody = document.querySelector("#targetTable tbody");
            targetTableBody.innerHTML = "";
            
            data.forEach(target => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td></td>
                    <td contenteditable="true">${target.row}</td>
                    <td contenteditable="true">${target.orderChange}</td>
                    <td contenteditable="true">${target.tokenName}</td>
                    <td>${target.currentPrice}</td>
                    <td></td>
                    <td contenteditable="true">${target.targetPrice}</td>
                    <td><button class="delTargetRow">Del</button></td>
                `;

                // Tạo và set giá trị cho các select
                const tableSelect = document.createElement("select");
                ['Order Table', 'Low Table'].forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option;
                    opt.textContent = option;
                    opt.selected = option === target.table;
                    tableSelect.appendChild(opt);
                });

                const logicSelect = document.createElement("select");
                ['>', '<', '='].forEach(option => {
                    const opt = document.createElement("option");
                    opt.value = option;
                    opt.textContent = option;
                    opt.selected = option === target.logic;
                    logicSelect.appendChild(opt);
                });

                row.querySelector("td:nth-child(1)").appendChild(tableSelect);
                row.querySelector("td:nth-child(6)").appendChild(logicSelect);

                targetTableBody.appendChild(row);
            });
        };
        reader.readAsText(file);
    }

    // Thêm event listeners cho Target table
    clearTargetTableButton.addEventListener("click", clearTargetTable);
    addTargetRowButton.addEventListener("click", addTargetRow);
    saveAsTargetTableButton.addEventListener("click", saveAsTargetTable);
    loadTargetTableInput.addEventListener("change", event => loadTargetTable(event.target.files[0]));

    // Thêm xử lý cho nút Del trong Target table
    document.addEventListener("click", function(event) {
        if (event.target.classList.contains("delTargetRow")) {
            event.target.closest("tr").remove();
        }
    });

    // Sửa phần xử lý sự kiện cho nút Load và input file
    loadOrderTableButton.addEventListener("click", () => {
        fileInputOrderTable.value = '';
        fileInputOrderTable.click();
    });

    fileInputOrderTable.addEventListener("change", event => {
        if (event.target.files.length > 0) {
            orderManager.loadOrderTable(event.target.files[0], document.getElementById("orderTableBody"))
                .then(() => support.showAlert("Order table loaded successfully"))
                .catch(error => support.showAlert("Error loading order table: " + error.message));
        }
    });

    // Tương tự cho Low Table và Target Table
    loadLowTableButton.addEventListener("click", () => {
        fileInputLowTable.value = '';
        fileInputLowTable.click();
    });

    loadTargetTableButton.addEventListener("click", () => {
        fileInputTargetTable.value = '';
        fileInputTargetTable.click();
    });

    fileInputLowTable.addEventListener("change", event => {
        if (event.target.files.length > 0) {
            loadLowTable(event.target.files[0]);
        }
    });

    fileInputTargetTable.addEventListener("change", event => {
        if (event.target.files.length > 0) {
            loadTargetTable(event.target.files[0]);
        }
    });

    // Thêm biến toàn cục cho giao dịch tự động
    let autoTradeTimer = null;
    let isAutoTrading = false;

    // Hàm tính toán giá bán và mua
    function calculatePrices() {
        const marginPercentage = parseFloat(document.getElementById('marginPercentage').value) / 100;
        const basePrice = parseFloat(document.getElementById('basePrice').value);
        
        const sellPrice = basePrice * (1 + marginPercentage);
        const buyPrice = basePrice;
        
        document.getElementById('sellPrice').textContent = sellPrice.toFixed(8);
        document.getElementById('buyPrice').textContent = buyPrice.toFixed(8);
        
        return { sellPrice, buyPrice };
    }

    // Hàm cập nhật logic giao dịch
    async function updateTradeLogic() {
        const currentPrice = varTokenPrice;
        const { sellPrice, buyPrice } = calculatePrices();
        const tokenAmount = parseFloat(document.getElementById('tokenAmount').value);
        const enumStatus = parseInt(document.getElementById('enumStatus').value);
        
        // Lấy giá trị logic hiện tại
        let d_b = parseInt(document.getElementById('d_b').textContent);
        let a_b = parseInt(document.getElementById('a_b').textContent);
        let d_m = parseInt(document.getElementById('d_m').textContent);
        let a_m = parseInt(document.getElementById('a_m').textContent);

        // Logic bán
        if (currentPrice < sellPrice && d_b > 0) {
            // Thực hiện lệnh bán
            const balance = await getTokenBalance();
            executeOrder({
                    apiKey: apiKeyInput.value,
                    secretKey: secretKeyInput.value,
                    passphrase: passphraseInput.value,
                    tdMode: 'cash',
                    side: 'sell',
                    ordType: 'market',
                    sz: balance,
                    tgtCcy: 'base_ccy'
                });
               
                support.showAlert("Bán thành công");
                console.log(`Bán thành công`);
                // Cập nhật trạng thái
                document.getElementById('enumStatus').value = '1';
                d_b = -1;
                a_b = 1;
            
        } else if (currentPrice > sellPrice && a_b > 0) {
            d_b = 1;
            a_b = -1;
        }

        // Logic mua
        if (currentPrice < buyPrice && d_m > 0) {
            a_m = 1;
            d_m = -1;
        } else if (enumStatus === 1 && currentPrice > buyPrice && a_m > 0) {
            // Thực hiện lệnh mua
            
            executeOrder({
                apiKey: apiKeyInput.value,
                secretKey: secretKeyInput.value,
                passphrase: passphraseInput.value,
                tdMode: 'cash',
                side: 'buy',
                ordType: 'market',
                sz: tokenAmount,
                tgtCcy: 'base_ccy'
            });
            
            support.showAlert("Mua thành công");
            console.log(`Mua thành công`);
            // Cập nhật trạng thái
            document.getElementById('enumStatus').value = '0';
            d_m = 1;
            a_m = -1;
        }

        // Cập nhật giá trị logic trên giao diện
        document.getElementById('d_b').textContent = d_b;
        document.getElementById('a_b').textContent = a_b;
        document.getElementById('d_m').textContent = d_m;
        document.getElementById('a_m').textContent = a_m;
    }

    // Thêm event listener cho nút bắt đầu giao dịch tự động
    document.getElementById('startAutoTrade').addEventListener('click', function() {
        isAutoTrading = !isAutoTrading;
        this.textContent = isAutoTrading ? 'Dừng giao dịch tự động' : 'Bắt đầu giao dịch tự động';
        
        if (isAutoTrading) {
            calculatePrices();
            autoTradeTimer = setInterval(() => {
                updateTradeLogic();
            }, updateInterval);
        } else {
            if (autoTradeTimer) {
                clearInterval(autoTradeTimer);
                autoTradeTimer = null;
            }
        }
    });

    // Thêm event listeners cho các input để tự động cập nhật giá
    ['marginPercentage', 'basePrice'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePrices);
    });
});
