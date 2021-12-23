(function() {
  "use strict";
  let bitcoinPrice;
  let currency;
  let tableLoaded = false;

  //Init currency
  chrome.storage.sync.get(['currency'], function(result) {
    currency = typeof(result.currency) != 'undefined' ? result.currency : "USD";
    fetchBitcoinPriceAndInit();
  });

  /**
  * Convert a string to a Dom element
  */
  function strToDom(str) {
    return document.createRange().createContextualFragment(str).firstChild;
  }

  /**
  * Fetch the bitcoin price and init
  */
  async function fetchBitcoinPriceAndInit() {
    let r = new XMLHttpRequest();
    r.open("GET", "https://blockchain.info/ticker", true);
    r.onreadystatechange = function (data) {
      if (r.readyState !== 4 || r.status !== 200) return;
      bitcoinPrice = JSON.parse(r.response);
      init();
    };
    r.send();
  }

  /**
  * Bitcoin to currency value
  */
  function btcToCurrency(btc) {
    return currency === "BTC" ? parseFloat(btc).toFixed(8) : new Intl.NumberFormat(chrome.i18n.getUILanguage(), {style: 'currency', currency: currency}).format(btc * bitcoinPrice[currency]['last']).toString().replace(/[a-zA-Z]/g,'');
  }

  /**
  * Init the display when the page is loaded
  */
  function init() {
    setInterval(function() {
      //if table not loaded
      if (document.querySelectorAll('table.e-table__body > tbody > tr') && document.querySelector('a[href="/exchange/wallets/spot"].router-link-active') && document.querySelector('.value-primary').innerHTML !== "-- BTC") {
        if (!tableLoaded) {
          tableLoaded = true;
          updateTable();
        }
      } else {
        tableLoaded = false;
      }
    }, 500);
  }

  /**
  * Update the table
  */
  function updateTable() {
    //currency selector
    let select = strToDom('<select style="color:#626973" id="currency-selector"><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option><option value="CNY">CNY</option><option value="JPY">JPY</option><option value="KRW">KRW</option><option value="INR">INR</option><option value="CAD">CAD</option><option value="BTC">BTC</option></select>')
    select.onchange = function() {
      currency = this.value;
      chrome.storage.sync.set({currency: currency});
      translateToCurrency();
    }
    select.value = currency;
    document.querySelector('.value-secondary').appendChild(select);

    //Display column name
    document.querySelector('th:nth-child(5) > .cell > .sortable').firstChild.nodeValue = chrome.i18n.getMessage("tokenPrice");
    document.querySelector('th:nth-child(6) > .cell > .sortable').firstChild.nodeValue = chrome.i18n.getMessage("value");

    //refresh when table sort is triggered
    document.querySelectorAll('table.e-table__body > tbody > tr')[1].firstChild.addEventListener('DOMSubtreeModified', (e) => {translateToCurrency()});

    translateToCurrency();
  }

  /**
  * Changes the display with the selected language
  */
  function translateToCurrency() {
    let rows = document.querySelectorAll('table.e-table__body > tbody > tr');

    //update currency total value
    document.querySelector('.value-secondary').firstChild.nodeValue = btcToCurrency(document.querySelector('.value-primary').textContent.slice(0, -4));

    //update currency table
    document.querySelectorAll('.token-price').forEach(e => e.remove());
    for (let i = 0, len = rows.length; i < len; i++) {
      //Unit price
      let column = rows[i].childNodes[4];
      column.firstChild.style.display = 'none';
      let btcValue = parseFloat(column.firstChild.innerHTML);
      let nbUnit = parseFloat(rows[i].childNodes[1].firstChild.innerHTML);
      let amount = btcToCurrency(btcValue / nbUnit);
      let tokenPriceCell = strToDom('<div class="cell token-price">' + amount + '</div>');
      column.appendChild(tokenPriceCell);

      //Value
      rows[i].childNodes[5].firstChild.innerHTML = btcToCurrency(rows[i].childNodes[4].firstChild.innerHTML);
    }
  }
})();
