class OKXApi {
    constructor(apiKey, secretKey, passphrase, isTestnet = false) {
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.passphrase = passphrase;
        this.baseUrl = isTestnet ? 'https://www.okx.com' : 'https://www.okx.com';
    }

    // Tạo signature cho API request
    async createSignature(timestamp, method, path, body = '') {
        const message = `${timestamp}${method}${path}${body}`;
        const encoder = new TextEncoder();
        const key = encoder.encode(this.secretKey);
        const data = encoder.encode(message);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            key,
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["sign"]
        );
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    // Tạo headers cho request
    async getHeaders(method, path, body = '') {
        const timestamp = new Date().toISOString();
        const signature = await this.createSignature(timestamp, method, path, body);

        return {
            'Content-Type': 'application/json',
            'OK-ACCESS-KEY': this.apiKey,
            'OK-ACCESS-SIGN': signature,
            'OK-ACCESS-TIMESTAMP': timestamp,
            'OK-ACCESS-PASSPHRASE': this.passphrase
        };
    }

    // Lấy giá token hiện tại
    async getTokenPrice(tokenSymbol) {
        try {
            const path = `/api/v5/market/ticker?instId=${tokenSymbol}-USDT`;
            const headers = await this.getHeaders('GET', path);
            
            const response = await fetch(this.baseUrl + path, { 
                method: 'GET',
                headers 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return parseFloat(data.data[0].last);
        } catch (error) {
            console.error('Error fetching token price:', error);
            throw error;
        }
    }

    // Lấy số dư token
    async getTokenBalance(token) {
        try {
            const path = `/api/v5/account/balance?ccy=${token}`;
            const headers = await this.getHeaders('GET', path);

            const response = await fetch(this.baseUrl + path, { 
                method: 'GET',
                headers 
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.code === '0') {
                const balanceDetails = data.data[0].details.find(detail => detail.ccy === token);
                return balanceDetails ? parseFloat(balanceDetails.cashBal) : 0;
            }
            throw new Error(`Failed to fetch balance: ${data.msg}`);
        } catch (error) {
            console.error('Error fetching balance:', error);
            throw error;
        }
    }

    // Thực hiện lệnh giao dịch
    async executeOrder(orderParams) {
        try {
            const path = '/api/v5/trade/order';
            const body = JSON.stringify({
                instId: `${orderParams.token}-USDT`,
                tdMode: orderParams.tdMode,
                side: orderParams.side,
                ordType: orderParams.ordType,
                sz: orderParams.sz,
                tgtCcy: orderParams.tgtCcy
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.code === '0') {
                return result.data[0];
            }
            throw new Error(`Order execution failed: ${result.msg}`);
        } catch (error) {
            console.error('Error executing order:', error);
            throw error;
        }
    }

    // Lấy lịch sử giao dịch
    async getTradeHistory(token, limit = 100) {
        try {
            const path = `/api/v5/trade/orders-history?instId=${token}-USDT&limit=${limit}`;
            const headers = await this.getHeaders('GET', path);

            const response = await fetch(this.baseUrl + path, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Error fetching trade history:', error);
            throw error;
        }
    }

    // Hủy lệnh
    async cancelOrder(orderId, token) {
        try {
            const path = '/api/v5/trade/cancel-order';
            const body = JSON.stringify({
                instId: `${token}-USDT`,
                ordId: orderId
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data[0];
        } catch (error) {
            console.error('Error canceling order:', error);
            throw error;
        }
    }

    async executeMarketOrder(token, side, size, tgtCcy) {
        try {
            const path = '/api/v5/trade/order';
            const body = JSON.stringify({
                instId: `${token}-USDT`,
                tdMode: 'cash',
                side: side,
                ordType: 'market',
                sz: size,
                tgtCcy: tgtCcy
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.code === '0') {
                return result.data[0];
            }
            throw new Error(`Market order execution failed: ${result.msg}`);
        } catch (error) {
            console.error('Error executing market order:', error);
            throw error;
        }
    }

    async executeLimitOrder(token, side, size, price, tgtCcy) {
        try {
            const path = '/api/v5/trade/order';
            const body = JSON.stringify({
                instId: `${token}-USDT`,
                tdMode: 'cash',
                side: side,
                ordType: 'limit',
                px: price,
                sz: size,
                tgtCcy: tgtCcy
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.code === '0') {
                return result.data[0];
            }
            throw new Error(`Limit order execution failed: ${result.msg}`);
        } catch (error) {
            console.error('Error executing limit order:', error);
            throw error;
        }
    }

    async executeFuturesMarketOrder(token, side, size, leverage) {
        try {
            const path = '/api/v5/trade/order';
            const body = JSON.stringify({
                instId: `${token}-USDT`,
                tdMode: 'cross', // hoặc 'isolated' tùy thuộc vào chế độ bạn muốn
                side: side,
                ordType: 'market',
                sz: size,
                lever: leverage // đòn bẩy
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.code === '0') {
                return result.data[0];
            }
            throw new Error(`Futures market order execution failed: ${result.msg}`);
        } catch (error) {
            console.error('Error executing futures market order:', error);
            throw error;
        }
    }

    async executeFuturesLimitOrder(token, side, size, price, leverage) {
        try {
            const path = '/api/v5/trade/order';
            const body = JSON.stringify({
                instId: `${token}-USDT`,
                tdMode: 'cross', // hoặc 'isolated' tùy thuộc vào chế độ bạn muốn
                side: side,
                ordType: 'limit',
                px: price,
                sz: size,
                lever: leverage // đòn bẩy
            });

            const headers = await this.getHeaders('POST', path, body);

            const response = await fetch(this.baseUrl + path, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.code === '0') {
                return result.data[0];
            }
            throw new Error(`Futures limit order execution failed: ${result.msg}`);
        } catch (error) {
            console.error('Error executing futures limit order:', error);
            throw error;
        }
    }

    saveApiKey(apiKeyInput, secretKeyInput, passphraseInput) {
        this.apiKey = apiKeyInput.value;
        this.secretKey = secretKeyInput.value;
        this.passphrase = passphraseInput.value;
        showAlert("API Key, Secret Key, and Passphrase saved.");
    }

    saveAsApiKey(apiKeyInput, secretKeyInput, passphraseInput) {
        const apiKeyData = {
            apiKey: apiKeyInput.value,
            secretKey: secretKeyInput.value,
            passphrase: passphraseInput.value
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(apiKeyData));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "apikeys.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    loadApiKey(file, apiKeyInput, secretKeyInput, passphraseInput) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const data = JSON.parse(event.target.result);
                apiKeyInput.value = data.apiKey;
                secretKeyInput.value = data.secretKey;
                passphraseInput.value = data.passphrase;
                
                // Reset file input để có thể load lại file
                document.getElementById('fileInput').value = '';
                
                showAlert("API keys loaded successfully");
            } catch (error) {
                showAlert("Error loading API keys: " + error.message);
            }
        };
        reader.onerror = function() {
            showAlert("Error reading file");
        };
        reader.readAsText(file);
    }
}

// Export class
export default OKXApi; 