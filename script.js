const API_KEY = 'CH0FS41R6NCU9SM7'; 

const stockInput = document.getElementById('stockInput');
const searchBtn = document.getElementById('searchBtn');
const trendingStocksDropdown = document.getElementById('trendingStocks');
const stockTableBody = document.getElementById('stockTableBody');
const stockChartElement = document.getElementById('stockChart');

let stockChart;
const stockDataStore = {};

const trendingStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
populateTrendingStocksDropdown(trendingStocks);

function populateTrendingStocksDropdown(stocks) {
  stocks.forEach(stock => {
    const option = document.createElement('option');
    option.value = stock;
    option.textContent = stock;
    trendingStocksDropdown.appendChild(option);
  });
}

searchBtn.addEventListener('click', () => fetchStockData(stockInput.value));
trendingStocksDropdown.addEventListener('change', () => {
  const selectedStock = trendingStocksDropdown.value;
  if (selectedStock) fetchStockData(selectedStock);
});

function fetchStockData(stockSymbol) {

  if (stockDataStore[stockSymbol]) {
    updateStockTable(stockSymbol, stockDataStore[stockSymbol]);
    updateStockGraph(stockSymbol, stockDataStore[stockSymbol]);
    return; 
  }

  fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockSymbol}&apikey=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
      console.log('Response Data:', data); 

      if (data['Time Series (Daily)']) {
        const stockData = data['Time Series (Daily)'];
        stockDataStore[stockSymbol] = stockData; 
        updateStockTable(stockSymbol, stockData);
        updateStockGraph(stockSymbol, stockData);
      } else {
        alert('Stock data not found.');
      }
    })
    .catch(error => {
      console.error('Error fetching stock data:', error);
      alert('An error occurred while fetching stock data.');
    });
}

function updateStockTable(stockSymbol, stockData) {
  const latestDate = Object.keys(stockData)[0];
  const latestData = stockData[latestDate];

  const price = latestData['4. close'];
  const volume = latestData['5. volume'];
  const change = (latestData['4. close'] - stockData[Object.keys(stockData)[1]]['4. close']).toFixed(2);


  const existingRow = Array.from(stockTableBody.getElementsByTagName('tr')).find(row => row.cells[0].textContent === stockSymbol);

  if (existingRow) {

    existingRow.cells[1].textContent = `$${price}`;
    existingRow.cells[2].textContent = `${change > 0 ? '+' : ''}${change}`;
    existingRow.cells[3].textContent = volume;
  } else {
 
    stockTableBody.innerHTML += `
      <tr>
        <td>${stockSymbol}</td>
        <td>$${price}</td>
        <td>${change > 0 ? '+' : ''}${change}</td>
        <td>${volume}</td>
      </tr>
    `;
  }
}

function updateStockGraph(stockSymbol, stockData) {
  const dates = Object.keys(stockData).slice(0, 30).reverse();
  const prices = dates.map(date => stockData[date]['4. close']);

  if (stockChart) stockChart.destroy(); 

  stockChart = new Chart(stockChartElement, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: `${stockSymbol} Stock Price`,
        data: prices,
        borderColor: 'rgba(75, 192, 192, 1)',
        fill: false,
        tension: 0.1
      }]
    }
  });
}


const textArray = [
  "Welcome to the Stock Tracker Dashboard",
  "Track your favorite stocks in real-time",
  "Get instant updates on stock changes",
];

let textIndex = 0;
let charIndex = 0;
const typingElement = document.querySelector('.typing');

function type() {
  if (charIndex < textArray[textIndex].length) {
    typingElement.innerHTML += textArray[textIndex].charAt(charIndex);
    charIndex++;
    setTimeout(type, 100); 
  } else {
    setTimeout(deleteText, 2000); 
  }
}

function deleteText() {
  if (charIndex > 0) {
    typingElement.innerHTML = textArray[textIndex].substring(0, charIndex - 1);
    charIndex--;
    setTimeout(deleteText, 50); 
  } else {
    textIndex++;
    if (textIndex >= textArray.length) {
      textIndex = 0; 
    }
    setTimeout(type, 500); 
  }
}

type();
