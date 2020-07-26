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
let defaultSize = { width: 200, height: 200, };
let counter = 0;

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    Sum(addition) {
        if (typeof (addition) === "number") {
            let x = this.x + addition;
            let y = this.y + addition;
            return new Vector(x, y);
        }
        else if (typeof (addition) === "object") {
            let x = this.x + addition.x;
            let y = this.y + addition.y;
            return new Vector(x, y);
        }
        else return undefined;
    }

    Multiply(multiplier) {
        if (typeof (multiplier) === "number") {
            let x = this.x * multiplier;
            let y = this.y * multiplier;
            return new Vector(x, y);
        }
        else if (typeof (multiplier) === "object") {
            return this.x * multiplier.x + this.y * multiplier.y;
        }
        else return undefined;
    }
}

class Figure {
    constructor(updateMethod, drawFigure, position) {
        this.img = new Image();
        this.img.src = "./img/frames3.png";

        this.size = { width: 800, height: 300 };

        //центр формы
        if (position)
            this.position = new Vector(position.x, position.y);
        else
            this.position = new Vector(300, 300);

        this.creationTime = Date.now();
        this.lifeTime = getRandomInt(60000, 120000);

        this.oldTime = Date.now();
        this.currentTime = Date.now();
        this.dTime = 0;
        this.fps = 1000 / 16;//16 fps
        this.frameSize = { width: this.size.width / 8, height: this.size.height / 2 };
        this.currentFrame = new Vector(0, 0);

        if (updateMethod) this.update = updateMethod;
        if (drawFigure) this.draw = drawFigure;
    }

    /*    update(){}
   
          draw(){} */
}

//генератор рандомных целых чисел в диапазоне
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getDistanceToCenter(x, y) {
    let x2 = x - lightSource.position.x;
    let y2 = y - lightSource.position.y;
    return Math.sqrt(x2 * x2 + y2 * y2);
}

function drawFigure() {
    canvasContext.drawImage(this.img, this.currentFrame.x, this.currentFrame.y, this.frameSize.width, this.frameSize.height,
        this.position.x - this.frameSize.width / 2, this.position.y - this.frameSize.height / 2, this.frameSize.width * 1.5, this.frameSize.height * 1.5)
}

//внешний метод класса фигуры, для неуправляемых фигур
function updateFigure() {

    this.currentTime = Date.now();
    this.dTime = this.currentTime - this.oldTime;
    if (this.dTime > this.fps) {
        this.dTime = 0;
        this.oldTime = this.currentTime;

        if (this.currentFrame.x < this.size.width - this.frameSize.width) {
            this.currentFrame.x = this.currentFrame.x + this.frameSize.width;
        }
        else if (this.currentFrame.y < this.size.height - this.frameSize.height) {
            this.currentFrame.x = 0;
            this.currentFrame.y = this.currentFrame.y + this.frameSize.height;
        }
        else {
            this.currentFrame.x = 0;
            this.currentFrame.y = 0;
        }
    }
}

//обновление состояния холста(анимация холста)
function updateCanvas() {

    counter = counter + 1;
    if (counter > 100000) { counter = 0 }

    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    for (let i = 0; i < figuresArray.length; i++) {
        //отрисовывает объект
        figuresArray[i].draw();
        //обновляет состояние объекта если внутри есть соответствующий метод
        if (figuresArray[i].update) {
            figuresArray[i].update();
        }
    }

    requestAnimationFrame(updateCanvas);
}

//главный круг
let lightSource = new Figure(updateFigure, drawFigure);
figuresArray.push(lightSource);

updateCanvas();

