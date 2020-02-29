const express = require("express");
const path = require("path");
const app = express();

app.use(express.static(path.join(__dirname, "/public")))
app.use(express.urlencoded({extended:false}))
app.use(express.json())



app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, "./public/index.html"));
});



const server = app.listen(3000, ()=> console.log(
`
	----- A-Frame Demo -----
	> Running on port 3000 <
	------------------------
`))

const io = require('socket.io')(server);

const cars = {}
const keys = {}

function Car () {
  this.orientation = {
    pos: {
      x: 0, y: 0.5, z: 0
    },
    rot: {
      x: 0, y: 0, z: 0
    }
  };
  this.vel =  0;
  this.fr = 0.0020;

  const acc =  0.0035;
  const maxVel = 0.2 

  this.accelerate = function (foward = true) {
    if (foward && this.vel > maxVel ) return;
    if (!foward && this.vel < -(maxVel/2) ) return;
    this.vel += acc * (foward ? 1 : -1)
  }

  this.rotate = function (dir = true) {
    //if (Math.abs(this.vel) < 0.06) return;
    if (Math.abs(this.vel) < 0.025) return;
    this.orientation.rot.y +=  ((-1 * this.vel) + 0.6 ) * (dir ? 1 : -1) 
    //this.orientation.rot.y += (0.2 * (dir ? 1 : -1)) / (this.vel*4)
  }
}

function toRads(degree) {
  return degree/360 * 2*Math.PI
}

Car.tick = function () {
  let changed = false;
  Object.keys(cars).forEach((key)=>{
    const car = cars[key];
    if (car.vel != 0) changed = true;

    if (car.vel > 0) {
      car.vel -= (keys[key] && (keys[key][65] || keys[key][83]) ? car.fr/4 : car.fr);
      if (car.vel < 0) car.vel = 0;
    }

    if (car.vel < 0) {
      car.vel += (keys[key] && (keys[key][65] || keys[key][83]) ? car.fr/4 : car.fr);
      if (car.vel > 0) car.vel = 0;
    }
  //console.log(car.vel)
  //console.log(car.orientation.rot.y)
      
    car.orientation.pos.x += Math.sin(toRads(car.orientation.rot.y)) * car.vel;
    car.orientation.pos.z += Math.cos(toRads(car.orientation.rot.y)) * car.vel;


    //car.orientation.pos.z += car.vel;
  })
  return changed;
}

io.on("connection",socket => {
  console.log(socket.id);

  socket.on("identification", ()=> {
    console.log("identification: ",socket.id)
    io.to(socket.id).emit("identification", socket.id)
  })

  cars[socket.id] = new Car();
  socket.emit("tick", cars)

  socket.on("input",(userKeys)=>{
    keys[socket.id] = userKeys;
    if (Object.keys(userKeys).map(a=>userKeys[a]).every(a=>!a)) delete keys[socket.id]

    //io.emit("tick", cars)
  })

  socket.on("disconnect",()=>{
    delete cars[socket.id]
  })

  socket.emit("id", socket.id)

})

function tick() {
  Object.keys(keys).forEach(playerId => {
    const key = keys[playerId];
    const car = cars[playerId];
    //console.log(keys);

    const   W = key[87],
        A = key[65],
        S = key[83],
        D = key[68],
        space = key[32]

    if (W) car.accelerate();
    if (A) car.rotate();
    if (D) car.rotate(false);
    if (S) car.accelerate(false);
  })
};

setInterval(()=>{
  tick();
  Car.tick() && io.emit("tick", cars)
}, 10)