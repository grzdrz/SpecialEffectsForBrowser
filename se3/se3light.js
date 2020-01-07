let canvas = document.querySelector("canvas");
let canvasContext = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

//при движении главный(управляемый) объект класса фигуры будет следовать за курсором
canvas.addEventListener("mousemove", () => {
    lightSource.position.x = event.clientX;
    lightSource.position.y = event.clientY;
});

let figuresArray = [];
let defaultSize = { width: 100, height: 100,};
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

class LightZone {
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

        this.radius = this.size.width / 2;

        if(updateMethod) this.update = updateMethod;
        if(drawMethod) this.draw = drawMethod;
    }
}

//генератор рандомных целых чисел в диапазоне
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistanceToCenter(x, y){
    let x2 = x - lightSource.position.x;
    let y2 = y - lightSource.position.y;
    return Math.sqrt(x2 * x2 + y2 * y2);
}

function drawMethod(){
    for(let i = 0; i < this.size.height; i++){
        for(let j = 0; j < this.size.width; j++){    
            let currentX = j + this.position.x - this.size.width / 2;
            let currentY = i + this.position.y - this.size.height / 2;
            let dist = Math.round(getDistanceToCenter(currentX, currentY));
            if(dist < this.radius){
                let k = dist / this.radius;
                canvasContext.fillStyle = `rgba(255, 255, 0, ${1 - k})`;
                canvasContext.fillRect(currentX, currentY, 1, 1);
            }
        }
    }
}

//внешний метод класса фигуры, для неуправляемых фигур
function updateFigure(){

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
let lightSource = new LightZone(null, drawMethod);
figuresArray.push(lightSource);

updateCanvas();