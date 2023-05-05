var myHeaders = new Headers();
myHeaders.append("apikey", "ioGh6Ny0LH5aIJ2kqJdWiNI7N5TmrgyX");

var requestOptions = {
  method: 'GET',
  redirect: 'follow',
  headers: myHeaders
};

const baseCurrency = document.querySelector('#base-currency');
const targetCurrency = document.querySelector('#target-currency');
const convertedAmountSpan = document.querySelector('#converted-amount');
const input = document.querySelector('#amount');
const save = document.querySelector('#save-favorite');
const currencyPairs = document.querySelector('#favorite-currency-pairs');
const historicalRatesDiv = document.querySelector('#historical-rates-container');
const historicalRatesButton = document.querySelector('#historical-rates');

function initializeButtons() {
  let buttons = JSON.parse(localStorage.getItem('buttons'));
  if (!buttons) {
    buttons = [];
    localStorage.setItem('buttons', JSON.stringify(buttons));
  }
}

let getSymbols = async () => {
  try {
    let data = await fetch("https://api.apilayer.com/exchangerates_data/symbols", requestOptions);

    let symbols = await data.json();

    let currencyOptions = Object.keys(symbols.symbols);

    currencyOptions.forEach(currencyOption => {
      let option1 = document.createElement('option');
      option1.value = currencyOption;
      option1.textContent = currencyOption;
      baseCurrency.appendChild(option1);

      let option2 = document.createElement('option');
      option2.value = currencyOption;
      option2.textContent = currencyOption;
      targetCurrency.appendChild(option2);
    });

  } catch (error) {
    console.log(error);
  }
}

let convert = async (base, target, amount) => {
  try {
    let data = await fetch(`https://api.apilayer.com/exchangerates_data/convert?to=${target}&from=${base}&amount=${amount}`, requestOptions);

    let result = await data.json();

    if (amount > 0 && target != base) {
      convertedAmountSpan.innerHTML = result.result.toFixed(2);
      convertedAmountSpan.className = '';
    } else {
      convertedAmountSpan.innerHTML = `Make sure that the base currency and target currency are not the same. Amount cannot be negative either. You must enter an valid amount.`;
      convertedAmountSpan.className = 'error';
    }


  } catch (error) {
    console.log(error);
  }
}

let getHistoricalExchangeRate = async (symbol, base) => {
  try {
    let data = await fetch(`https://api.apilayer.com/exchangerates_data/2013-12-24?symbols=${symbol}&base=${base}`, requestOptions);

    let result = await data.json();

    let resultRatesKey = Object.keys(result.rates)[0];

    let p = document.createElement('p');
    p.innerHTML = `Historical exchange rate on ${result.date}: 1 ${base} = ${result.rates[resultRatesKey].toFixed(2)} ${symbol}`;

    historicalRatesDiv.appendChild(p);
  } catch (error) {
    console.log(error)
  }
}

let addButtonsToStorage = (base, target) => {
  let buttons = JSON.parse(localStorage.getItem('buttons'));

  let buttonObj = {
    base: base,
    target: target
  }

  if (!buttons.some(button => button.base === buttonObj.base && button.target === buttonObj.target)) {
    buttons.push(buttonObj);
    createFavButton(buttonObj.base, buttonObj.target);
  }


  localStorage.setItem('buttons', JSON.stringify(buttons));
}

let createFavButton = (base, target) => {
  let button = document.createElement('button');
  button.innerHTML = `${base}/${target}`;
  button.id = `${base}-${target}`;
  currencyPairs.appendChild(button);
}

let loadButtons = (buttons) => {
  if (buttons.length) {
    buttons.forEach(button => {
      createFavButton(button.base, button.target);
    });
  }
}

let addEventListenerToFavButtons = (div) => {
  if (div.hasChildNodes()) {
    div.childNodes.forEach(childNode => {
      childNode.addEventListener('click', (event) => {
        event.preventDefault();
        let favCurrencyPair = childNode.id.split('-');
        baseCurrency.value = favCurrencyPair[0];
        targetCurrency.value = favCurrencyPair[1];
      });
    });
  }
}

initializeButtons();
let buttons = JSON.parse(localStorage.getItem('buttons'));
getSymbols();

if (buttons.length) {
  loadButtons(buttons);
  addEventListenerToFavButtons(currencyPairs);
}

input.addEventListener('input', (event) => {
  event.preventDefault();

  convert(baseCurrency.value, targetCurrency.value, input.value);

});

save.addEventListener('click', (event) => {
  event.preventDefault();
  addButtonsToStorage(baseCurrency.value, targetCurrency.value);
  addEventListenerToFavButtons(currencyPairs);
});

historicalRatesButton.addEventListener('click', (event) => {
  event.preventDefault();
  historicalRatesDiv.innerHTML = "";

  getHistoricalExchangeRate(targetCurrency.value, baseCurrency.value);
});
