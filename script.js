const messages = document.querySelector('.main')
const form = document.querySelector('.footer__form')
const input = document.querySelector('.form__input')
const button = document.querySelector('.form__button')


const state = {
    active: false,
    username: null, 
    lastResult: null, 
    operation: null, 
    numbers: null, 
    setnum: {value: null, num: null}
}

form.addEventListener('submit', (event)=>{
    event.preventDefault();
    const text = input.value.trim();
    input.value = '';
    if (text === '') return;
    addMessage(text, 'user');
    processCommand(text);
})

input.addEventListener('input', buttonState);
function buttonState(){
    const isEmpty = input.value.trim() === '';
    button.disabled = isEmpty;
    button.style.backgroundColor = isEmpty ? 'rgb(90, 90, 90)' : 'rgb(254, 222, 62)';
    button.style.cursor = isEmpty ? 'not-allowed' : 'pointer';
}

function botTyping(text, delay = 800){
    const typing = document.createElement('div')
    typing.className = 'bot bot--typing';
    typing.innerHTML = `
        <img class="bot bot__avatar" src= "bot_avatar.png" width="40" height="40">
        <p class= "bot bot__text">
            <span class="dot dot1"></span>
            <span class="dot dot2"></span>
            <span class="dot dot3"></span>
        </p>
    `;
    messages.prepend(typing);
    setTimeout(()=> {
        typing.remove();
        addMessage(text, 'bot');
    }, delay);
}

function addMessage(text, sender, withTyping = false){
    if (sender === 'bot' && withTyping){
        botTyping(text);
        return;
    }
    const bodySender = document.createElement('div');
    bodySender.className = `${sender}`;
    const img = document.createElement('img');
    img.className = `${sender} ${sender}__avatar`;
    img.src =  `${sender}_avatar.png`;
    img.width="40"; 
    img.height="40";
    const p = document.createElement('p');
    p.className = `${sender} ${sender}__text`;
    p.innerText = text;
    bodySender.append(img, p);
    messages.prepend(bodySender);
}

const messageFalse = 'Введите команду /start, чтобы начать общение';
const messageTrue = 'Мы уже начали работу! Напишите /numbers и два числа. Например: /numbers: 2, 3';
const messageHello = 'Привет, меня зовут Чат-бот. Давай познакомимся! Напиши /name и своё имя.';
const messageWelcome = 'Давай расскажу, что я умею. Команда /numbers сохраняет числа. Ты можешь ввести диапазон, например 1...3. Также /set, чтобы я запомнил число. И чтобы прекратить мою работу введи /stop'
const messageUnknown = 'Я не знаю такой команды. Вот, что я умею: /name, /numbers, /set, /stop';
const errNameEmpty = 'Напиши имя после /name, например: /name Анна';
const messageParseAns = 'Нет предыдущего результата. Подсчитай, что-нибудь, чтобы использовать ans'
const errParseRange = 'Введите от меньшего числа к большему';
const errRangeNum = 'Границы диапазона должны быть числами';
const errFunNum = 'Нужно минимум два числа. Пример: /numbers 2, 3';
const messageInputSign = 'Числа приняты. Выберите действие';
const errUnknownOperation = 'Я не знаю такой операции';
const errSetForm= 'Формат: /set имя = значение. Имя переменной должно начинаться с буквы или _.';
const errSetNumber = 'Значение должно быть целым числом';
const messageStop = 'Пока-пока! Был рад тебе помочь! Возвращайся снова';

function processCommand(text){
    if (!state.active){
        if (text.trim().toLowerCase() === '/start'){
            handleStart();
        }else{
            addMessage(messageFalse, 'bot', true);
        }
        return;
    }
    if (text.startsWith('/')){
        const parts = text.split(' ');
        const command = parts[0].toLowerCase().replace(':', '');
        if (command === '/start') handleStart();
        else if (command === '/name') handleName(text);
        else if (command === '/numbers')handleNumber(text);
        else if (command === '/stop') handleStop();
        else if (command === '/set') handleSet(text);
        else addMessage(messageUnknown, 'bot', true)
    }else { addMessage(messageUnknown, 'bot', true) }
}

function handleStart(){
    if (state.active){
        addMessage(messageTrue, 'bot', true);
        return;
    }
    state.active = true;
    addMessage(messageHello, 'bot', true);
} 
function handleName(text){
    const arr = text.replace(/\/name\s*:?\s*/i, '');
    if (state.username === null){
        state.username = arr
        addMessage(`Приятно познакомиться, ${state.username}!`, 'bot', true)
        addMessage(messageWelcome, 'bot', true)
        return;
    }
    else if (!arr) {
        addMessage(errNameEmpty, 'bot', true)
        return;
    }
    else{
        state.username = arr
        addMessage(`Приятно познакомиться, ${state.username}!`, 'bot', true)
        return;
    }
}

function parseNum(text){
    const parts = text.split(/[,;\s]+/).filter(Boolean);
    const result = [];
    for (let i =0; i < parts.length; i++){
        const part = parts[i];
        if (part.toLowerCase() === 'ans'){
            if (state.lastResult === null){
                addMessage(messageParseAns, 'bot', true);
                return [];
            }
            result.push(state.lastResult);
            continue;
        }
        if (state.setnum.value !== null && part.toLowerCase() === state.setnum.value.toLowerCase()){
            result.push(state.setnum.num);
            continue;
        }
        
        if (part.includes('...') || part.includes('..')){
            const [a, b] = part.split(/\.{2,3}/).map(j => parseInt(j, 10));
            if (a > b) {
                addMessage(errParseRange, 'bot'); 
                return [];
            }
            result.push(...rangeArray(a, b));
            continue;
        }
        const num = parseInt(part, 10);
        if (Number.isFinite(num)) result.push(num);
    }
    return result;
}

function rangeArray(a, b){
    const MAX = 1000;
    const length = (b - a)+1;
    const result = []
    if (!Number.isFinite(a) || !Number.isFinite(b)){
        addMessage(errRangeNum, 'bot');
        return [];
    }
    if (length > MAX){
        addMessage(`Диапазон слишком большой (${length}). Максимум: ${MAX}`, 'bot');
        return [];
    }
    for (let i = a;i <= b; i++){
        result.push(i);
    }
    return result;
}

function handleNumber(text){
    const arr = text.replace(/\/numbers\s*:?\s*/i, '');
    let numbers;
    try{
        numbers = parseNum(arr);
    } catch(err){
        addMessage(err.message, 'bot');
        return;
    }    
    if(numbers.length < 2) {
        addMessage(errFunNum, 'bot');
        return;
    }
    state.numbers = numbers;
    inputSign();
}

function inputSign(){
    addMessage(messageInputSign, 'bot');
    const container = document.createElement('div');
    container.className = 'radio-grid';
    const sign = ['+', '-', '*' , '/', 'min', 'max', 'avg', 'gcd'];
    for (let i = 0; i < sign.length; i++){
        const bodyInput = document.createElement('label');
        bodyInput.className = 'label';
        const inputSign = document.createElement('input');
        inputSign.type = 'radio';
        inputSign.name = 'operation';
        inputSign.value = sign[i];
        inputSign.className = 'radio__input';
        const span = document.createElement('span');
        span.innerText = sign[i];
        span.className = 'radio__card';
        bodyInput.append(inputSign, span);
        container.append(bodyInput);
    }
    container.addEventListener('change', event => {
        if (event.target.name !== 'operation') return;
        state.operation = event.target.value;
        container.classList.add('radio-grid--locked');
        container.querySelectorAll('input[type="radio"]').forEach(rad => {
            rad.disabled = true;
        })
        addMessage(`Вы выбрали: ${event.target.value}`, 'bot', true)
        try{
            const result = calculate(state.numbers, state.operation);
            state.lastResult = result;
            addMessage(`Результат: ${result}`, 'bot', true);
        } catch (err) {
            addMessage(err.message, 'bot')
        }
    });
    messages.prepend(container);
}

function calculate(numbers, operation){
    if (operation === '+')return numbers.reduce((last, cur)=> last + cur, 0)
    else if(operation === '-') return numbers.reduce((last, cur)=> last - cur);
    else if(operation === '*') return numbers.reduce((last, cur)=> last * cur, 1);
    else if(operation === '/') return numbers.reduce((last, cur)=> last / cur);
    else if(operation === 'min') return Math.min(...numbers);
    else if(operation === 'max') return Math.max(...numbers);
    else if(operation === 'avg') return numbers.reduce((last, cur)=> last + cur, 0)/ numbers.length;
    else if(operation === 'gcd') {
        const _gcd = (a, b) =>(!b ? a : _gcd(b, a % b));
        return numbers.reduce((last, cur)=> _gcd(last, cur));
    }else{
        addMessage(errUnknownOperation, 'bot')
        return 0
    }
}

function handleSet(text){
    const arr = text.replace(/\/set\s*:?\s*/i, '').trim();
    const parts = arr.split(/\s*=\s*|\s+/).filter(Boolean);
    if (parts.length < 2 ){
        addMessage(errSetForm, 'bot')
        return;
    }
    const name = parts[0];
    const num = Number(parts[1]);
    if (!/^[A-Za-zА-Яа-я_][\wА-Яа-я]*$/.test(name)){
        addMessage(errSetForm, 'bot');
        return;
    }
    if (!Number.isFinite(num)){
        addMessage(errSetNumber, 'bot');
        return;
    }
    state.setnum.value = name;
    state.setnum.num = num;
    addMessage(`Переменная ${state.setnum.value} = ${state.setnum.num} сохранена`, 'bot',  true);
    return;
}

function handleStop(){
    addMessage(messageStop, 'bot', true)
    state.active = false;
    state.username = null;
    state.lastResult = null; 
    state.operation= null;
    state.numbers = null; 
    state.setnum.value = null
    state.setnum.num = null
}

buttonState();
