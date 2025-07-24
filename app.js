async function loadData(interval) {
  document.getElementById('output').textContent = 'جارٍ تحميل البيانات...';

  const symbol = 'BTCUSDT'; // يمكنك تغييره لأي زوج تفضله
  const limit = 100; // عدد الشموع
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const formattedData = data.map(c => [
      c[0], // الوقت
      c[1], // فتح
      c[2], // أعلى
      c[3], // أدنى
      c[4], // إغلاق
      c[5]  // حجم
    ]);

    const analyzer = new ElliottWaveAnalyzer();
    const result = analyzer.analyze(formattedData);
    analyzer.printAnalysis(result);

    // عرض النتائج
    document.getElementById('output').textContent = result.summary || 'تم التحليل بنجاح.';
  } catch (err) {
    document.getElementById('output').textContent = 'خطأ في تحميل البيانات: ' + err.message;
  }
}
