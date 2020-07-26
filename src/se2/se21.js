let canvas = document.querySelector("canvas");
let canvasContext = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

//при движении главный(управляемый) объект класса фигуры будет следовать за курсором
canvas.addEventListener("mousemove", () => {
    mainFigure.position.x = event.clientX;
    mainFigure.position.y = event.clientY;
});

let figuresArray = [];
let defaultSize = { width: 40, height: 40,};
let counter = 0;
let waveVelocity = 4;
let waveLength = 800;
let angleVelocity = (Math.PI * 2 * waveVelocity) / waveLength;

class Vector {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    Sum(addition){
        if(typeof(addition) === "number"){
            let x = this.x + addition;
            let y = this.y + addition;
            return new Vector(x, y);
        }
        else if(typeof(addition) === "object"){
            let x = this.x + addition.x;
            let y = this.y + addition.y;
            return new Vector(x, y);
        }
        else return undefined;
    }

    Multiply(multiplier){
        if(typeof(multiplier) === "number"){
            let x = this.x * multiplier;
            let y = this.y * multiplier;
            return new Vector(x, y);
        }
        else if(typeof(multiplier) === "object"){
            return this.x * multiplier.x + this.y * multiplier.y;
        }
        else return undefined;
    }
}

class SomeFigure {
    constructor(updateMethod, drawMethod, position){
        this.size = {width: defaultSize.width, height: defaultSize.height};
        this.color = `rgba(255, 0, 0, 1)`;

        //центр формы
        if(position) 
            this.position = new Vector(position.x, position.y);
        else
        this.position = new Vector(
            getRandomInt(0, canvas.width),
            getRandomInt(0, canvas.height)); 

        this.velocity = new Vector(getRandomInt(0, 0), getRandomInt(0, 0));

        this.creationTime = Date.now();
        this.lifeTime = getRandomInt(60000, 120000);

        this.counter = 0;

        if(updateMethod)this.update = updateMethod;
        if(drawMethod)this.draw = drawMethod;
    }

    update(){}

    draw(){}
}

//генератор рандомных целых чисел в диапазоне
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistanceToMainFigure(circle){
    let x = mainFigure.position.x - circle.position.x;
    let y = mainFigure.position.y - circle.position.y;
    return Math.sqrt(x * x + y * y);
}

function drawFigure(){
    canvasContext.beginPath();

    canvasContext.arc(this.position.x,
         this.position.y,
         this.size.height / 2, 
         0, Math.PI * 2, true);
    
    canvasContext.fillStyle = this.color; 
    canvasContext.fill(); 
}

//внешний метод класса фигур, для неуправляемых фигур
function updateFigure(){

    let acceleration = new Vector(0, 0);
    this.position = this.position.Sum(this.velocity).Sum(acceleration.Multiply(0.5)); 
    this.velocity = this.velocity.Sum(acceleration);

    //размер неуправляемых фигур зависит от расстояния до главной фигуры синусоидально
    //k в данном случае 0 < k < 1, т.к. результат работы синус-функции 
    let dist = getDistanceToMainFigure(this);
    let waveDisplacement = angleVelocity * (counter - dist / waveVelocity);
    let k = Math.sin(waveDisplacement);
    if(Math.abs(k) < 0.2) k = 0.2;//чтоб фигуры не были слишком маленькими

    this.size.width = defaultSize.width * Math.abs(k);
    this.size.height = defaultSize.height * Math.abs(k);
 
    //цвет так же зависит от расстояния до главной фигуры синусоидально
    let alphaChannel = 1 - Math.abs(k);
    this.color = `rgba(255, ${(Math.abs(k)) * 100}, ${(Math.abs(k)) * 255}, ${alphaChannel})`; 

    if(Date.now() - this.creationTime > this.lifeTime){
        return false;
    }
    else{
        return true;
    }
}

//обновление состояния холста(анимация холста)
function updateCanvas(){

    counter = counter + 1;
    if(counter > 100000){counter = 0}

    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    for(let i = 0; i < figuresArray.length; i++){
        let isAlive = true;
        //обновляет состояние объекта если внутри есть соответствующий метод
        if(figuresArray[i].update){ 
            isAlive = figuresArray[i].update();
        }

        //отрисовывает объект
        figuresArray[i].draw();

        //если врем жизни объекта вышло, то он удаляется из массива объектов и соответственно уничтожается сборщиком мусора
        if(!(isAlive)){
            figuresArray[i] = null;
        }
    }
    //чистит массив от пустых ячеек
    figuresArray = figuresArray.filter(a => a !== null);

    requestAnimationFrame(updateCanvas);
}

//главный круг
let mainFigure = new SomeFigure();
figuresArray.push(mainFigure);

//неуправляемые круги расположенные хаотично
for(let i = 0; i < 1500; i++){
    figuresArray.push(new SomeFigure(updateFigure, drawFigure));
}

/* //неуправляемые круги расположенные равномерно
let temp1 = canvas.width / defaultSize.width;
let temp2 = canvas.height / defaultSize.height;
for(let i = 0; i < temp2; i++){
    for(let j = 0; j < temp1; j++){
        let tempVector = new Vector((j * defaultSize.width) + defaultSize.width / 2, (i * defaultSize.height) + defaultSize.height / 2);
        figuresArray.push(new SomeFigure(updateFigure, drawFigure, tempVector));
    }
} */


updateCanvas();

// x = Asin(wt) = Asin(w) = Asin(V);
// w = V/t = V;


