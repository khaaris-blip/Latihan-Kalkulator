const result = document.getElementById("result");
const history = document.getElementById("history");
const buttons = document.querySelector(".buttons");

let expression = "";
let justCalculated = false;


// Mengubah tampilan ekspresi
function formatExpression(value) {
    return value
        .replace(/\*/g, " × ")
        .replace(/\//g, " ÷ ")
        .replace(/\+/g, " + ")
        .replace(/-/g, " − ");
}


// Menghitung ekspresi tanpa eval()
function calculateExpression(input) {
    const tokens = input.match(/\d+(?:\.\d*)?|\.\d+|[+\-*/]/g);

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Ekspresi tidak valid");
    }

    let index = 0;

    function factor() {
        if (tokens[index] === "-") {
            index++;
            return -factor();
        }

        if (tokens[index] === "+") {
            index++;
            return factor();
        }

        const number = Number(tokens[index]);
        index++;

        if (!Number.isFinite(number)) {
            throw new Error("Angka tidak valid");
        }

        return number;
    }

    function term() {
        let value = factor();

        while (
            tokens[index] === "*" ||
            tokens[index] === "/"
        ) {
            const operator = tokens[index];
            index++;

            const next = factor();

            if (operator === "*") {
                value *= next;
            } else {
                if (next === 0) {
                    throw new Error("Tidak bisa dibagi nol");
                }

                value /= next;
            }
        }

        return value;
    }

    function expressionResult() {
        let value = term();

        while (
            tokens[index] === "+" ||
            tokens[index] === "-"
        ) {
            const operator = tokens[index];
            index++;

            const next = term();

            if (operator === "+") {
                value += next;
            } else {
                value -= next;
            }
        }

        return value;
    }

    const answer = expressionResult();

    if (index !== tokens.length || !Number.isFinite(answer)) {
        throw new Error("Ekspresi tidak valid");
    }

    return answer;
}


// Membuat angka lebih rapi
function formatNumber(number) {
    return String(Number(number.toPrecision(12)));
}


// Memperbarui layar
function updateDisplay() {
    result.textContent = expression
        ? formatExpression(expression)
        : "0";

    history.textContent = "";

    if (!expression || /[+\-*/.]$/.test(expression)) {
        return;
    }

    try {
        const answer = calculateExpression(expression);
        history.textContent = "= " + formatNumber(answer);
    } catch (error) {
        history.textContent = "";
    }
}


// Memasukkan angka
function inputNumber(number) {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    expression += number;
    updateDisplay();
}


// Memasukkan operator
function inputOperator(operator) {
    justCalculated = false;

    if (!expression) {
        if (operator === "-") {
            expression = "-";
        }

        updateDisplay();
        return;
    }

    if (/[+\-*/]$/.test(expression)) {
        expression = expression.slice(0, -1);
    }

    expression += operator;
    updateDisplay();
}


// Memasukkan desimal
function inputDecimal() {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    }

    const currentNumber = expression.split(/[+\-*/]/).pop();

    if (currentNumber.includes(".")) {
        return;
    }

    if (!currentNumber) {
        expression += "0.";
    } else {
        expression += ".";
    }

    updateDisplay();
}


// Menghapus satu karakter
function deleteNumber() {
    if (justCalculated) {
        expression = "";
        justCalculated = false;
    } else {
        expression = expression.slice(0, -1);
    }

    updateDisplay();
}


// Menghapus semua
function clearCalculator() {
    expression = "";
    justCalculated = false;
    history.textContent = "";
    result.textContent = "0";
}


// Persentase
function percentage() {
    if (justCalculated) {
        justCalculated = false;
    }

    const match = expression.match(/(\d*\.?\d+)$/);

    if (!match) return;

    const number = Number(match[0]);
    const percentageValue = number / 100;

    expression = expression.slice(0, -match[0].length)
        + formatNumber(percentageValue);

    updateDisplay();
}


// Menghitung hasil akhir
function calculate() {
    if (!expression || /[+\-*/.]$/.test(expression)) {
        return;
    }

    try {
        const oldExpression = formatExpression(expression);
        const answer = calculateExpression(expression);

        expression = formatNumber(answer);

        result.textContent = expression;
        history.textContent = oldExpression + " =";

        justCalculated = true;

    } catch (error) {
        history.textContent = error.message;
        result.textContent = "Error";

        expression = "";
        justCalculated = false;
    }
}


// Mendeteksi klik tombol
buttons.addEventListener("click", function(event) {

    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
    }

    if (button.dataset.operator) {
        inputOperator(button.dataset.operator);
    }

    switch (button.dataset.action) {

        case "clear":
            clearCalculator();
            break;

        case "delete":
            deleteNumber();
            break;

        case "decimal":
            inputDecimal();
            break;

        case "percent":
            percentage();
            break;

        case "calculate":
            calculate();
            break;
    }

});


// Tampilan awal
updateDisplay();