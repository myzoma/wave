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
        }
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
