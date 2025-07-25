// Web-compatible API for Binance integration
class WebBinanceAPI {
    constructor() {
       this.proxyURL = 'https://corsproxy.io/?';
const url = `${this.proxyURL}https://api1.binance.com/api/v3/ticker/price?symbol=BTCUSDT`;

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

            const response = await fetch(`${url}?${params}`);

            if (response.ok) {
                const data = await response.json();
                console.log(`تم الحصول على ${data.length} شمعة بنجاح`);
                return data;
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على البيانات:', error.message);
            
            // Try alternative approach with JSONP-like fallback
            // محاولة استخدام CORS proxy
            console.log('محاولة بديلة باستخدام CORS proxy...');
            try {
                const proxyResponse = await fetch(`https://cors-anywhere.herokuapp.com/${this.baseURL}/api/v3/klines?${params}`);
                if (proxyResponse.ok) {
                    const data = await proxyResponse.json();
                    console.log(`تم الحصول على ${data.length} شمعة عبر proxy`);
                    return data;
                }
            } catch (proxyError) {
                console.error('فشل CORS proxy:', proxyError.message);
            }
            
            throw new Error('لا يمكن الوصول إلى Binance API. جرب:\n1. تشغيل الملف من web server محلي\n2. استخدام برنامج سطح المكتب');
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
            throw new Error('لا يمكن الحصول على السعر بسبب قيود CORS. يرجى تشغيل الملف من web server.');
        }
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
