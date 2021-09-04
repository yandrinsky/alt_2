const canvas = document.querySelector("#canvas");
const delLineBtn = document.querySelector("#delLine");

canvas.width = 500;
canvas.height = 500;
let context = canvas.getContext("2d");

context.strokeStyle = "red"

const shift = {
    top: window.canvas.getBoundingClientRect().top,
    left: window.canvas.getBoundingClientRect().left
}


const state = {
    deletingIndex: undefined, //индекс текущего удаляемого элемента (обновляется при наведении)
    isDragging: false,
    lines: [],  //массив объектов {start{x. y}, end: {x, y}, children: [], circle: boolean, parent}
    lastDrewPoint: {x: 10 - shift.left, y: 10 - shift.top}, //координаты последней отрисованной точки (для рисования новой линии)
    toggle: false, //флаг для клика рисования. false - если линия сейчас не рисуется
    startLine: [{}, {}], //массив содержит координаты начала и конца линии, которая сейчас рисуется
}

function stopDeleting(){
    canvas.removeEventListener("mousemove",  delLine);
    canvas.removeEventListener("click",  stopDeleting);
    document.body.style.cursor = "default"
}

function deleting(){
    const line = state.lines[state.deletingIndex];
    const parent = line.parent;

    if(parent && parent !== "deleted"){
        const parentIndex = parent.children?.indexOf(line);
        //убираем элемент из детей отца
        parent.children?.splice(parentIndex, 1);
        //если у родителя нет детей, убираем его круг
        if(parent.children.length === 0){
            parent.circle = false;
        }
    }

    //убираем элемент из родителя детей
    line.children.forEach(line => {
        if(line) line.parent = "deleted";
    })

    //вырезаем сам элемент
    state.lines.splice(state.deletingIndex,1);

    //убираем обработчики событий навеведения и клика для удаления.
    canvas.removeEventListener("mousemove",  delLine);
    canvas.removeEventListener("click",  deleting);
    document.body.style.cursor = "default"
    //перерисовываем холст
    redraw(state.lines);

}


//вызывается по нажатию кнопки удаления. Переход в режим удаления: по наведению и клику по линии произойдёт delete.
function delLine(e){
    document.body.style.cursor = "crosshair"
    return isInLine(e, (line)=>{
        state.deletingIndex = state.lines.indexOf(line)
        canvas.addEventListener("click", deleting);
    }, ()=> {
        canvas.addEventListener("click", stopDeleting);
    })
}

function delLineHandler(){
    canvas.addEventListener("mousemove",  delLine)
}


function isInLine(e, callbackSuccess, callbackFail){
    let x0 = e.clientX
    let y0 = e.clientY

    for(let i = 0; i < state.lines.length; i++){
        let x1 = state.lines[i].start.x
        let y1 = state.lines[i].start.y
        let x2 = state.lines[i].end.x
        let y2 = state.lines[i].end.y
        //проверяем, не вышел ли за пределы координат икса курсор
        if((x0 > x1 - 10) &&  (x0 < x2 + 10) || (x0 > x2 - 10) &&  (x0 < x1 + 10)){
            //ищем расстояние от мышки до прямой
            let len = Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
            let distance = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - x1 * y2) / len;
            if(distance < 10){
                drawLine(state.lines[i], "black");
                if(callbackSuccess) callbackSuccess(state.lines[i]);

                break;
            } else {
                if(callbackFail) callbackFail(state.lines[i]);

            }
        }
    }

}

function isInHead(e){
    let x = e.clientX
    let y = e.clientY

    for(let i = 0; i < state.lines.length; i++){
        let headX = state.lines[i].end.x;
        let headY = state.lines[i].end.y;
        if((x < headX + 10 && x > headX - 10) && (y < headY + 10 && y > headY - 10) && state.lines[i].children.length < 2){
            document.body.style.cursor = "pointer";
            drawCircle(headX, headY);
            window.canvas.onclick = (e)=> click(e, state.lines[i]);
            break;
        } else {
            if(!state.isDragging){
                window.canvas.onclick = undefined;
            }
            document.body.style.cursor = "default";
            redraw(state.lines);
        }
    }
}

function addNewLine(start, end, parentLine){
    const line = {
        start,
        end,
        circle: false,
        parent: parentLine,
        children: [],
    }

    //доавбляем в список линий
    state.lines.push(line);
    //добавляем в дети родителя (у первого элемента нет родителя)
    if(parentLine){
        parentLine.children.push(line);
        parentLine.circle = true;
    }

}

window.canvas.addEventListener("mousemove", isInHead);
window.canvas.addEventListener("mousemove", isInLine);

function drawLine(line, color = "red"){
    context.beginPath();
    context.moveTo(line.start.x, line.start.y);
    context.lineTo(line.end.x, line.end.y);
    context.strokeStyle = color;
    context.lineWidth = 5;
    context.stroke();
}

function drawLines(line) {
    state.lines.forEach(line => {
        context.beginPath();
        context.moveTo(line.start.x, line.start.y);
        context.lineTo(line.end.x, line.end.y);
        context.strokeStyle = "red";
        context.lineWidth = 5;
        context.stroke();

        if(line.circle){
            drawCircle(line.end.x, line.end.y);
        }

    })
}

function redraw(lines){
    context.beginPath();
    context.moveTo(0, 0);
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawLines(lines);
}

function drawCircle(x, y){
    context.beginPath();
    context.arc(x, y, 10, 0, 2 * Math.PI);
    context.fillStyle = "red";
    context.fill();
}

function draw(e, start){
    let {top, left} = window.canvas.getBoundingClientRect();

    redraw(state.lines);

    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(start.x, start.y);
    context.lineTo(e.clientX - left, e.clientY - top);
    context.strokeStyle = "red";
    context.stroke();

    state.lastDrewPoint.x = e.clientX - left;
    state.lastDrewPoint.y = e.clientY - top;
}


//let startLine = [{}, {}];

function click(e, parentLine){
    state.startLine[0] = state.startLine[1];
    state.startLine[1] = {x: e.clientX - shift.left, y: e.clientY - shift.top};
    let start = state.startLine[1];
    if(!state.toggle){
        window.canvas.onmousemove = (e) => draw(e, start);
        if(parentLine){
            parentLine.circle = true;
        }
        state.isDragging = true;
        state.toggle = true;
    } else {
        //прекращаем стоить новую линию
        window.canvas.onmousemove = undefined;
        //вызываем функцию добавления элемента
        addNewLine({...state.startLine[0]}, {...state.lastDrewPoint}, parentLine);

        state.toggle = false;
        state.isDragging = false;
    }
}
window.canvas.onclick = click;
delLineBtn.onclick = delLineHandler;