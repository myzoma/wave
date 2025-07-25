// Web API مع روابط Binance المباشرة
class WebBinanceAPI {
    constructor() {
        // روابط بديلة لـ Binance API بدون قيود CORS
        this.endpoints = [
            'https://api1.binance.com',
            'https://api2.binance.com',
            'https://api3.binance.com',
            'https://api4.binance.com'
        ];
        this.currentEndpointIndex = 0;
        console.log('تم تهيئة WebBinanceAPI مع روابط مباشرة');
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

    // الحصول على بيانات الشموع
    async getKlineData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
        try {
            console.log(`جاري الحصول على بيانات ${symbol} - ${interval} - ${limit} شمعة`);
            
            return await this.fetchWithRetry('/api/v3/klines', {
                symbol: symbol.toUpperCase(),
                interval: interval,
                limit: limit.toString()
            });
        } catch (error) {
            console.error('خطأ في الحصول على بيانات الشموع:', error);
            throw new Error('فشل الحصول على بيانات التداول. يرجى المحاولة لاحقاً');
        }
    }

    // الحصول على السعر الحالي
    async getCurrentPrice(symbol = 'BTCUSDT') {
        try {
            console.log(`جاري الحصول على السعر الحالي لـ ${symbol}`);
            
            const data = await this.fetchWithRetry('/api/v3/ticker/price', {
                symbol: symbol.toUpperCase()
            });
            
            return parseFloat(data.price);
        } catch (error) {
            console.error('خطأ في الحصول على السعر الحالي:', error);
            throw new Error('فشل الحصول على السعر الحالي');
        }
    }

    // اختبار الاتصال
    async testConnection() {
        try {
            console.log('جاري اختبار الاتصال بـ Binance API');
            
            await this.fetchWithRetry('/api/v3/ping');
            console.log('✓ تم الاتصال بـ Binance API بنجاح');
            
            return { 
                status: 'success', 
                message: 'تم الاتصال بنجاح' 
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
