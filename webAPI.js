// Web-compatible API for Binance integration
class WebBinanceAPI {
    constructor() {
        this.baseURL = 'https://api.binance.com';
        this.proxyURL = 'https://cors-anywhere.herokuapp.com/'; // CORS proxy for development
    }

    // Get candlestick data
    async getKlineData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
        try {
            const url = `${this.baseURL}/api/v3/klines`;
            const params = new URLSearchParams({
                symbol: symbol.toUpperCase(),
                interval: interval,
                limit: limit.toString()
            });

            console.log(`جاري الحصول على بيانات ${symbol} - الفترة: ${interval} - العدد: ${limit}`);

            const response = await fetch(`${url}?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`تم الحصول على ${data.length} شمعة بنجاح`);
                return data;
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على البيانات:', error.message);
            
            // Fallback to mock data for development
            console.log('استخدام بيانات وهمية للتطوير...');
            return this.getMockKlineData(symbol, limit);
        }
    }

    // Get current price
    async getCurrentPrice(symbol = 'BTCUSDT') {
        try {
            const url = `${this.baseURL}/api/v3/ticker/price`;
            const params = new URLSearchParams({
                symbol: symbol.toUpperCase()
            });

            const response = await fetch(`${url}?${params}`);
            
            if (response.ok) {
                const data = await response.json();
                return parseFloat(data.price);
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على السعر:', error.message);
            
            // Return mock price
            const mockPrices = {
                'BTCUSDT': 43250.75,
                'ETHUSDT': 2680.50,
                'ADAUSDT': 0.4825,
                'BNBUSDT': 310.25,
                'XRPUSDT': 0.5875,
                'SOLUSDT': 98.45,
                'DOTUSDT': 7.32,
                'LINKUSDT': 15.87
            };
            
            return mockPrices[symbol.toUpperCase()] || 100.0;
        }
    }

    // Generate mock candlestick data for development
    getMockKlineData(symbol, limit) {
        const data = [];
        let basePrice = 45000; // Base price for BTC
        
        // Adjust base price for different symbols
        const priceMultipliers = {
            'BTCUSDT': 45000,
            'ETHUSDT': 2650,
            'ADAUSDT': 0.48,
            'BNBUSDT': 310,
            'XRPUSDT': 0.58,
            'SOLUSDT': 95,
            'DOTUSDT': 7.3,
            'LINKUSDT': 15.8
        };
        
        basePrice = priceMultipliers[symbol.toUpperCase()] || 100;
        
        const now = Date.now();
        const intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds
        
        for (let i = limit - 1; i >= 0; i--) {
            const openTime = now - (i * intervalMs);
            const closeTime = openTime + intervalMs - 1;
            
            // Generate realistic price movement
            const priceChange = (Math.random() - 0.5) * basePrice * 0.02; // 2% max change
            const open = basePrice + priceChange;
            const variation = basePrice * 0.01; // 1% variation
            
            const high = open + Math.random() * variation;
            const low = open - Math.random() * variation;
            const close = low + Math.random() * (high - low);
            const volume = Math.random() * 1000 + 100;
            
            basePrice = close; // Update base price for next candle
            
            // Binance kline format: [timestamp, open, high, low, close, volume, close_time, quote_volume, count, taker_buy_volume, taker_buy_quote_volume, ignore]
            data.push([
                openTime,
                open.toFixed(8),
                high.toFixed(8),
                low.toFixed(8),
                close.toFixed(8),
                volume.toFixed(8),
                closeTime,
                (volume * close).toFixed(8),
                Math.floor(Math.random() * 100),
                (volume * 0.6).toFixed(8),
                (volume * close * 0.6).toFixed(8),
                "0"
            ]);
        }
        
        return data;
    }

    // Test connection
    async testConnection() {
        try {
            const response = await fetch(`${this.baseURL}/api/v3/time`);
            
            if (response.ok) {
                console.log('✓ تم الاتصال بـ Binance API بنجاح');
                return { status: 'success', message: 'الاتصال بـ API نجح' };
            }
            
            throw new Error('فشل في الاتصال');
            
        } catch (error) {
            console.log('⚠ استخدام الوضع التجريبي - البيانات الوهمية');
            return { status: 'mock', message: 'استخدام البيانات الوهمية للتطوير' };
        }
    }
}

// Make it available globally
window.WebBinanceAPI = WebBinanceAPI;
