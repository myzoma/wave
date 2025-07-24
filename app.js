async function loadData(interval) {
  document.getElementById('output').textContent = 'جارٍ تحميل البيانات...';

  const symbol = 'BTCUSDT'; // يمكنك تغييره إلى أي زوج تريده
  const limit = 100; // عدد الشموع
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // تنسيق البيانات حسب المطلوب
    const formattedData = data.map(c => [
      c[0], // الوقت
      c[1], // سعر الافتتاح
      c[2], // أعلى سعر
      c[3], // أدنى سعر
      c[4], // سعر الإغلاق
      c[5]  // حجم التداول
    ]);

    // استدعاء المحلل
    const analyzer = new ElliottWaveAnalyzer();
    const result = analyzer.analyze(formattedData);

    // عرض النتائج بشكل منسق
    let outputText = '';

    if (result.error) {
      outputText = 'خطأ: ' + result.error;
    } else {
      outputText = `
نتائج التحليل:
--------------------------
العملة: BTCUSDT
السعر الأخير: ${result.data.latestClose}
نمط إليوت: ${result.summary}
مستوى الثقة: ${result.confidence}%
الاتجاه العام: ${result.trend}
تاريخ النمط: ${new Date(result.data.pivotTime).toLocaleString()}

التفاصيل:
- أعلى سعر خلال الفترة: ${result.data.high}
- أدنى سعر خلال الفترة: ${result.data.low}
`;
    }

document.getElementById('output').innerHTML = `<pre>${outputText}</pre>`;  } catch (err) {
    document.getElementById('output').textContent = 'خطأ في تحميل البيانات: ' + err.message;
  }
}
