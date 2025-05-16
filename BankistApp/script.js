'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-02-28T09:15:04.904Z',
    '2021-03-01T10:17:24.185Z',
    '2021-03-13T14:11:59.604Z',
    '2021-03-15T17:01:17.194Z',
    '2021-03-16T23:36:17.929Z',
    '2021-03-17T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2010-11-01T13:15:33.035Z',
    '2010-11-30T09:48:16.867Z',
    '2011-12-25T06:04:23.907Z',
    '2021-01-25T14:18:46.235Z',
    '2021-02-05T16:33:06.386Z',
    '2021-03-15T14:43:26.374Z',
    '2021-03-16T18:49:59.371Z',
    '2021-03-17T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

const formatMovDate = function(date){
  const dayCalc = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  
  const dayPass = dayCalc(new Date(), date);

  if(dayPass === 0) return 'Today';
  if(dayPass === 1) return 'Yesterday';
  if(dayPass <= 7) return `${dayPass} days ago`;

  // const day = `${date.getDate()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0);
  // const year = date.getFullYear();

  // return `${day}/${month}/${year}`;
  return new Intl.DateTimeFormat(navigator.language).format(date);
}

const formatCur = function(value, locale, currency){
  return new Intl.NumberFormat(locale, {style: 'currency', currency: currency}).format(value);
}

const displayMove = function(acc, sort = false){
  containerMovements.innerHTML = '';

  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  
  const movDate = sort ? acc.movementsDates.slice().reverse() : acc.movementsDates;

  movs.forEach(function (mov, i){
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(movDate[i]);
    const displayDate = formatMovDate(date);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${i + 1}.${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formatCur(mov, navigator.language, acc.currency)}</div>
      </div>
    `;
    
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}

const displayBalance = function(acc){
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(acc.balance, navigator.language, acc.currency)}`;
}

const displaySummary = function(acc){
  const income = acc.movements
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(income, navigator.language, acc.currency)}`;
  
  const outcome = acc.movements
  .filter(mov => mov < 0)
  .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(Math.abs(outcome), navigator.language, acc.currency)}`;

  const interest = acc.movements
  .filter(mov => mov > 0)
  .map(depos => (depos * acc.interestRate) / 100)
  .filter(int => int >= 1)
  .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(interest, navigator.language, acc.currency)}`;
};

const createUser = function (accs) {
  accs.forEach(function(acc){
    acc.userName = acc.owner
    .toLowerCase()
    .split(" ")
    .map(name => name[0])
    .join('');
  });
};

createUser(accounts);

const updateUI = function (acc) {
  displayMove(acc);
  displayBalance(acc);
  displaySummary(acc);
}

const startLogOutTimer = function(){
  let time = 120;
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to Get Started...';
      containerApp.style.opacity = 0;
    }
    time--;
  }
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

let currentAccount, timer;

btnLogin.addEventListener('click', function(e){
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.userName === inputLoginUsername.value);
  if (currentAccount?.pin === +(inputLoginPin.value)){
    labelWelcome.textContent = `Welcome Back, ${currentAccount.owner.split(' ')[0]}`;
    
    containerApp.style.opacity = 100;
    
    const date = new Date();
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // const hour = `${date.getHours()}`.padStart(2, 0);
    // const min = `${date.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}.:${min}`;
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(date);

    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function(e){
  e.preventDefault();
  const amount = +(inputTransferAmount.value);
  const recieveAcc = accounts.find(acc => acc.userName === inputTransferTo.value);
    
  inputTransferTo.value = inputTransferAmount.value = '';

  if(recieveAcc && amount > 0 && currentAccount.balance >= amount && recieveAcc !== currentAccount.userName) {
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    recieveAcc.movements.push(amount);
    recieveAcc.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function(e){
  e.preventDefault();
  
  const amount = Math.floor(inputLoanAmount.value);

  if(amount > 0 && currentAccount.movements.some(mov => mov >= amount*0.1)){
    setTimeout(function(){
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUI(currentAccount)}, 2500
    );
  }
  inputLoanAmount.value = '';
  
  clearInterval(timer);
  timer = startLogOutTimer();
});

btnClose.addEventListener('click', function(e){
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.userName && +(inputClosePin.value) === currentAccount.pin){
    const index = accounts.findIndex(acc => acc.userName === currentAccount.userName);

    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function(e){
  e.preventDefault();
  
  displayMove(currentAccount, !sorted);
  sorted = !sorted;
});

