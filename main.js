const ElliottWaveAnalyzer = require('./elliottWaveAnalyzer');
const BinanceAPI = require('./binanceAPI');

// ضع مفاتيح Binance الخاصة بك هنا
const BINANCE_API_KEY = 'YOUR_API_KEY_HERE';
const BINANCE_API_SECRET = 'YOUR_API_SECRET_HERE';

class TradingBot {
    constructor() {
        this.binanceAPI = new BinanceAPI(BINANCE_API_KEY, BINANCE_API_SECRET);
        this.elliottAnalyzer = new ElliottWaveAnalyzer({
            len1: 4,
            len2: 8,
            len3: 16,
            minWaveLength: 0.5,
            maxWaveLength: 5.0
        });
        
        this.symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'BNBUSDT'];
        this.intervals = ['1h', '4h', '1d'];
    }

    // تشغيل التحليل لرمز واحد
    async analyzeSymbol(symbol, interval = '1h', limit = 100) {
        try {
            console.log(`\n🔍 تحليل ${symbol} - ${interval}`);
            console.log('═'.repeat(50));

            // الحصول على البيانات من Binance
            const klineData = await this.binanceAPI.getKlineData(symbol, interval, limit);
            
            if (!klineData || klineData.length === 0) {
                throw new Error('لم يتم الحصول على بيانات');
            }

            // تشغيل تحليل Elliott Wave
            const analysis = this.elliottAnalyzer.analyze(klineData);

            // طباعة النتائج
            this.printAnalysisResults(symbol, interval, analysis);

            return analysis;

        } catch (error) {
            console.error(`❌ خطأ في تحليل ${symbol}:`, error.message);
            return null;
        }
    }

    // طباعة نتائج التحليل بشكل منظم
    printAnalysisResults(symbol, interval, analysis) {
        console.log(`📊 نتائج تحليل ${symbol} - ${interval}`);
        console.log(`الحالة: ${analysis.status}`);
        
        if (analysis.status === 'success') {
            console.log(`💰 السعر الحالي: $${analysis.currentPrice.toFixed(4)}`);
            console.log(`📈 عدد الأنماط المكتشفة: ${analysis.patterns.length}`);
            
            if (analysis.patterns.length > 0) {
                const topPattern = analysis.patterns[0];
                console.log(`🎯 أفضل نمط: ${topPattern.type} ${topPattern.direction}`);
                console.log(`🔥 مستوى الثقة: ${topPattern.confidence.toFixed(1)}%`);
                
                if (topPattern.confidence >= 75) {
                    console.log('🚀 إشارة قوية!');
                } else if (topPattern.confidence >= 60) {
                    console.log('⚡ إشارة متوسطة');
                } else {
                    console.log('⚠️  إشارة ضعيفة');
                }
            }
            
            console.log(`📝 الملخص: ${analysis.summary}`);
            
            // طباعة تفاصيل الأنماط
            if (analysis.patterns.length > 0) {
                console.log('\n📋 تفاصيل الأنماط:');
                analysis.patterns.slice(0, 3).forEach((pattern, index) => {
                    console.log(`  ${index + 1}. ${pattern.direction} - الثقة: ${pattern.confidence.toFixed(1)}%`);
                });
            }
            
        } else {
            console.log(`📝 الرسالة: ${analysis.message}`);
        }
        
        console.log('─'.repeat(50));
    }

    // تشغيل التحليل لعدة رموز
    async runMultiSymbolAnalysis() {
        console.log('🤖 بدء التحليل المتعدد للرموز...\n');

        for (const symbol of this.symbols) {
            for (const interval of this.intervals) {
                await this.analyzeSymbol(symbol, interval, 100);
                
                // انتظار قصير لتجنب تجاوز حدود API
                await this.sleep(1000);
            }
        }
    }

    // تشغيل التحليل المستمر
    async runContinuousAnalysis(symbol = 'BTCUSDT', interval = '1h', intervalMinutes = 15) {
        console.log(`🔄 بدء التحليل المستمر لـ ${symbol} كل ${intervalMinutes} دقيقة`);
        
        while (true) {
            try {
                await this.analyzeSymbol(symbol, interval, 100);
                
                console.log(`⏰ انتظار ${intervalMinutes} دقيقة للتحليل التالي...\n`);
                await this.sleep(intervalMinutes * 60 * 1000);
                
            } catch (error) {
                console.error('❌ خطأ في التحليل المستمر:', error.message);
                console.log('⏰ محاولة مرة أخرى خلال دقيقة...\n');
                await this.sleep(60000);
            }
        }
    }

    // دالة الانتظار
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // اختبار الاتصال بـ Binance
    async testConnection() {
        console.log('🔗 اختبار الاتصال بـ Binance API...');
        const result = await this.binanceAPI.testConnection();
        console.log(`📡 حالة الاتصال: ${result.message}\n`);
        return result.status !== 'failed';
    }
}

// دالة الرئيسية
async function main() {
    console.log('🚀 بدء تشغيل محلل Elliott Wave');
    console.log('═'.repeat(60));

    const bot = new TradingBot();

    // اختبار الاتصال أولاً
    const connectionOk = await bot.testConnection();
    
    if (!connectionOk) {
        console.error('❌ فشل في الاتصال بـ Binance API');
        process.exit(1);
    }

    // اختر نوع التشغيل
    const args = process.argv.slice(2);
    
    if (args.includes('--multi')) {
        // تحليل متعدد الرموز
        await bot.runMultiSymbolAnalysis();
        
    } else if (args.includes('--continuous')) {
        // تحليل مستمر
        const symbol = args[args.indexOf('--symbol') + 1] || 'BTCUSDT';
        const interval = args[args.indexOf('--interval') + 1] || '1h';
        await bot.runContinuousAnalysis(symbol, interval);
        
    } else {
        // تحليل واحد (افتراضي)
        const symbol = args[0] || 'BTCUSDT';
        const interval = args[1] || '1h';
        await bot.analyzeSymbol(symbol, interval);
    }
}

// تشغيل التطبيق
if (require.main === module) {
    main().catch(error => {
        console.error('❌ خطأ في التطبيق:', error.message);
        process.exit(1);
    });
}

module.exports = TradingBot;
