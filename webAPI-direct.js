// Web API متوافق مع ElliottWaveAnalyzer
class WebBinanceAPI {
    constructor() {
        // استخدام روابط Binance المباشرة
        this.endpoints = [
            'https://api1.binance.com',
            'https://api2.binance.com',
            'https://api3.binance.com',
            'https://api4.binance.com'
        ];
        this.currentEndpointIndex = 0;
    }

    // الحصول على الرابط الحالي
    getCurrentEndpoint() {
        return this.endpoints[this.currentEndpointIndex];
    }

    // التبديل إلى الرابط التالي في حالة الفشل
    switchToNextEndpoint() {
        this.currentEndpointIndex = (this.currentEndpointIndex + 1) % this.endpoints.length;
        console.log(`تم التبديل إلى الرابط: ${this.getCurrentEndpoint()}`);
    }

    // دالة مساعدة للاتصال بالـ API
    async fetchWithRetry(url, params = {}, retries = this.endpoints.length) {
        let lastError;
        
        for (let i = 0; i < retries; i++) {
            try {
                const endpoint = this.getCurrentEndpoint();
                const queryString = new URLSearchParams(params).toString();
                const fullUrl = `${endpoint}${url}?${queryString}`;
                
                console.log('جاري الاتصال بـ:', fullUrl);
                
                const response = await fetch(fullUrl);
                
                if (response.ok) {
                    return await response.json();
                } else if (response.status === 429) {
                    // تجاوز حد الطلبات، جرب الرابط التالي
                    this.switchToNextEndpoint();
                    continue;
                }
            } catch (error) {
                console.error(`المحاولة ${i + 1} فشلت:`, error.message);
                lastError = error;
                this.switchToNextEndpoint();
                
                // انتظار قصير قبل المحاولة التالية
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        throw lastError || new Error('فشل جميع محاولات الاتصال');
    }

    // الحصول على بيانات الشموع - متوافق مع ElliottWaveAnalyzer
    async getKlineData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
        try {
            const klines = await this.fetchWithRetry('/api/v3/klines', {
                symbol: symbol.toUpperCase(),
                interval: interval,
                limit: limit.toString()
            });

            // تحويل البيانات إلى التنسيق المتوقع من قبل ElliottWaveAnalyzer
            return klines.map(k => ({
                time: k[0] / 1000, // تحويل من مللي ثانية إلى ثواني
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5]),
                closeTime: k[6] / 1000, // تحويل من مللي ثانية إلى ثواني
                quoteAssetVolume: parseFloat(k[7]),
                numberOfTrades: k[8],
                takerBuyBaseAssetVolume: parseFloat(k[9]),
                takerBuyQuoteAssetVolume: parseFloat(k[10])
            }));
        } catch (error) {
            console.error('خطأ في الحصول على بيانات الشموع:', error);
            throw new Error('فشل الحصول على بيانات التداول');
        }
    }

    // الحصول على السعر الحالي
    async getCurrentPrice(symbol = 'BTCUSDT') {
        try {
            const data = await this.fetchWithRetry('/api/v3/ticker/price', {
                symbol: symbol.toUpperCase()
            });
            
            return parseFloat(data.price);
        } catch (error) {
            console.error('خطأ في الحصول على السعر الحالي:', error);
            throw new Error('فشل الحصول على السعر الحالي');
        }
    }

    // دالة مساعدة لتحويل البيانات إلى صيغة OHLCV
    formatOHLCV(data) {
        return data.map(item => ({
            time: item.time,
            open: item.open,
            high: item.high,
            low: item.low,
            close: item.close,
            volume: item.volume
        }));
    }

    // اختبار الاتصال
    async testConnection() {
        try {
            await this.fetchWithRetry('/api/v3/ping');
            return { 
                status: 'success', 
                message: 'تم الاتصال بـ Binance API بنجاح' 
            };
        } catch (error) {
            console.error('فشل اختبار الاتصال:', error);
            return { 
                status: 'error', 
                message: 'فشل الاتصال بـ Binance API' 
            };
        }
    }
}

// جعل الكائن متاحاً عالمياً
window.WebBinanceAPI = WebBinanceAPI;
