async function loadData(interval) {
  document.getElementById('output').textContent = 'جارٍ تحميل البيانات...';

  const symbol = 'BTCUSDT'; // يمكنك تغييره
  const limit = 100;
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
    const result = analyzer.analyze(formattedData, symbol);
    const outputText = analyzer.printAnalysis(result);

    document.getElementById('output').textContent = outputText;
  } catch (err) {
    document.getElementById('output').textContent = 'خطأ في تحميل البيانات: ' + err.message;
  }
}
