let canvas = document.querySelector("canvas");
let canvasContext = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;

//при движении главный(управляемый) объект класса капли будет следовать за курсором
canvas.addEventListener("mousemove", () => {
    mainDrop.position.x = event.clientX - mainDrop.size.width / 2;
    mainDrop.position.y = event.clientY - mainDrop.size.height / 2;
});
//при кликах генерируются новые объекты класса капли в рандомных местах(по умолчанию)
canvas.addEventListener("mouseup", () => {
    dropsArray.push(new Drop(updateDrops))
    });

let dropsArray = [];

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

class Drop {
    constructor(updateMethod){
        this.size = { width: 35, height: 50,};
        this.color = `rgba(150, 10, 250, 1)`;

        this.position = new Vector(getRandomInt(0, canvas.width), getRandomInt(0, canvas.height / 4));
        this.velocity = new Vector(0, 5);


        this.creationTime = Date.now();
        this.lifeTime = getRandomInt(5000, 10000);

        this.update = updateMethod;
    }

    draw(){
        drawBlob(this);
    }

    update(){ }
}

function drawBlob(rectangle){
    canvasContext.beginPath();
    canvasContext.moveTo(
        rectangle.position.x + rectangle.size.width / 2, rectangle.position.y);

    //форма выверена на глаз
    canvasContext.lineTo(
        rectangle.position.x, rectangle.position.y + rectangle.size.height * 0.70);
    canvasContext.bezierCurveTo(
        rectangle.position.x, rectangle.position.y + rectangle.size.height * 0.85,
        rectangle.position.x + rectangle.size.width * 0.15, rectangle.position.y + rectangle.size.height,
        rectangle.position.x + rectangle.size.width / 2, rectangle.position.y + rectangle.size.height
    );
    canvasContext.bezierCurveTo(
        rectangle.position.x + rectangle.size.width * 0.85, rectangle.position.y + rectangle.size.height,
        rectangle.position.x + rectangle.size.width, rectangle.position.y + rectangle.size.height * 0.85,
        rectangle.position.x + rectangle.size.width, rectangle.position.y + rectangle.size.height * 0.70
    );

    canvasContext.closePath();
    canvasContext.fillStyle = rectangle.color;
    canvasContext.fill(); 
}

//генератор рандомных целых чисел в диапазоне
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//внешний метод класса капли, для неуправляемых капель
function updateDrops(){
    let acceleration = new Vector(0, 0.1);
    this.position = this.position.Sum(this.velocity).Sum(acceleration.Multiply(0.5)); 
    this.velocity = this.velocity.Sum(acceleration);

    //если капля вылетает за границы холста, то его телепортит в верхнюю часть холста
    if(this.position.x > canvas.width || this.position.x < 0 || this.position.y > canvas.height || this.position.y < 0){
        this.position = new Vector(getRandomInt(0, canvas.width), getRandomInt(0, canvas.height / 4));
        this.velocity = new Vector(0, 5);
    }

    if(Date.now() - this.creationTime > this.lifeTime){
        return false;
    }
    else {
        return true;
    }
}

//обновление состояния холста(анимация холста)
function updateCanvas(){
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    for(let i = 0; i < dropsArray.length; i++){

        let isAlive = true;
        //обновляет состояние объекта если внутри есть соответствующий метод
        if(dropsArray[i].update){ 
            isAlive = dropsArray[i].update();
        }

        //альфа канал зависит от дистанции капли до низа холста
        let distToDown = canvas.height - dropsArray[i].position.y;
        dropsArray[i].color = `rgba(100, 50, 250, ${1 - (distToDown / canvas.height)})`; 
        //отрисовывает объект
        dropsArray[i].draw();

        //если врем жизни объекта вышло, то он удаляется из массива объектов и соответственно уничтожается сборщиком мусора
        if(!(isAlive)){
            dropsArray[i] = null;
        }
    }
    //чистит массив от пустых ячеек
    dropsArray = dropsArray.filter(a => a !== null);

    requestAnimationFrame(updateCanvas);
}

//главная капля
let mainDrop = new Drop();
dropsArray.push(mainDrop);

//рандомные капли
//метод добавляется через конструктор, а не по ссылке, чтобы не оставлять внешних ссылок на объект и удалить его уборщиком мусора
dropsArray.push(new Drop(updateDrops));
dropsArray.push(new Drop(updateDrops));

updateCanvas();

// a(t) + V1(t) = V2(t);
// (V2^2 - V1^2)/(2a)  + pos1 = pos2;
// p2 = p1 + V1 +- a / 2;