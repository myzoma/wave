const axios = require('axios');
const crypto = require('crypto');

class BinanceAPI {
    constructor(apiKey, apiSecret) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.baseURL = 'https://api1.binance.com';
    }

    // إنشاء التوقيع للطلبات المحمية
    createSignature(queryString) {
        return crypto
            .createHmac('sha256', this.apiSecret)
            .update(queryString)
            .digest('hex');
    }

    // الحصول على بيانات الكاندل (الشموع اليابانية)
    async getKlineData(symbol = 'BTCUSDT', interval = '1h', limit = 100) {
        try {
            const url = `${this.baseURL}/api/v3/klines`;
            const params = {
                symbol: symbol.toUpperCase(),
                interval: interval,
                limit: limit
            };

            console.log(`جاري الحصول على بيانات ${symbol} - الفترة: ${interval} - العدد: ${limit}`);

            const response = await axios.get(url, { params });

            if (response.status === 200) {
                console.log(`تم الحصول على ${response.data.length} شمعة بنجاح`);
                return response.data;
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على البيانات:', error.message);
            if (error.response) {
                console.error('تفاصيل الخطأ:', error.response.data);
            }
            throw error;
        }
    }

    // الحصول على سعر الرمز الحالي
    async getCurrentPrice(symbol = 'BTCUSDT') {
        try {
            const url = `${this.baseURL}/api/v3/ticker/price`;
            const params = { symbol: symbol.toUpperCase() };

            const response = await axios.get(url, { params });
            
            if (response.status === 200) {
                return parseFloat(response.data.price);
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على السعر:', error.message);
            throw error;
        }
    }

    // الحصول على معلومات الحساب (يتطلب API Key و Secret)
    async getAccountInfo() {
        try {
            const timestamp = Date.now();
            const queryString = `timestamp=${timestamp}`;
            const signature = this.createSignature(queryString);

            const url = `${this.baseURL}/api/v3/account`;
            const params = {
                timestamp: timestamp,
                signature: signature
            };

            const headers = {
                'X-MBX-APIKEY': this.apiKey
            };

            const response = await axios.get(url, { params, headers });

            if (response.status === 200) {
                return response.data;
            }

            throw new Error(`HTTP Error: ${response.status}`);

        } catch (error) {
            console.error('خطأ في الحصول على معلومات الحساب:', error.message);
            throw error;
        }
    }

    // التحقق من صحة API Keys
    async testConnection() {
        try {
            // اختبار الاتصال العام
            const publicTest = await axios.get(`${this.baseURL}/api/v3/time`);
            
            if (publicTest.status !== 200) {
                throw new Error('فشل في الاتصال بـ Binance API');
            }

            console.log('✓ تم الاتصال بـ Binance API بنجاح');

            // إذا كان لديك مفاتيح API، اختبرها
            if (this.apiKey && this.apiSecret) {
                try {
                    await this.getAccountInfo();
                    console.log('✓ مفاتيح API تعمل بشكل صحيح');
                    return { status: 'success', message: 'جميع الاختبارات نجحت' };
                } catch (keyError) {
                    console.log('⚠ مفاتيح API غير صالحة أو غير موجودة - سيتم استخدام البيانات العامة فقط');
                    return { status: 'partial', message: 'الاتصال العام يعمل، لكن مفاتيح API لا تعمل' };
                }
            }

            return { status: 'public_only', message: 'الاتصال العام يعمل - لا توجد مفاتيح API' };

        } catch (error) {
            console.error('خطأ في اختبار الاتصال:', error.message);
            return { status: 'failed', message: error.message };
        }
    }
}

module.exports = BinanceAPI;
