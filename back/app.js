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

function Car (name) {
  this.orientation = {
    pos: {
      x: 0, y: 0, z: 0
    },
    rot: {
      x: 0, y: 0, z: 0
    }
  };
  this.bumped = false;
  this.inmortal = false;
  this.knockouts = 0;
  this.vel =  0;
  this.fr = 0.0008;

  this.rotating = 0;

  const rotatingMax = 0.6;
  const acc =  0.002;
  const maxVel = 0.25;
  
  this.color = ["red","green","blue","yellow"][Math.floor(Math.random()*4)]
  this.name = name

  this.accelerate = function (forward = true) {
    if (forward && this.vel > maxVel ) return;
    if (!forward && this.vel < -(maxVel/2) ) return;
    this.vel += acc * (forward ? 1 : -1)
  }

  this.rotate = function (direction = true) {
    //if (Math.abs(this.vel) < 0.06) return;
    //if (Math.abs(this.vel) < 0.005) return;
    //this.orientation.rot.y +=  ((-1 * this.vel) + 0.6 ) * (dir ? 1 : -1) 

    // NEW ROTATE

    if (Math.abs(this.rotating) > rotatingMax) return;
    const dir = (this.vel > 0 ? 1 : -1) * direction
    if (this.vel > 0.075)
      this.orientation.rot.y += (dir ? 1 : -1)*(-1.4*Math.abs(this.vel) + 0.69)/1.2;
    else 
      this.orientation.rot.y += (dir ? 1 : -1)*(-103*(Math.abs(this.vel) - 0.15)*Math.abs(this.vel))/1.2;

    //this.rotating += (((-1 * this.vel) + 0.6 ) * (dir ? 1 : -1))/50
    //console.log(this.rotating)
    
  }
}

function toRads(degree) {
  return degree/360 * 2*Math.PI
}

Car.tick = function () {
  const mappedCords = Object.keys(cars).map(key => {
    const car = cars[key]
    return {
      key,
      inmortal: car.inmortal || car.bumped,
      x: car.orientation.pos.x + Math.sin(car.orientation.rot.y /180 * Math.PI) * -1.4, 
      z: car.orientation.pos.z + Math.cos(car.orientation.rot.y /180 * Math.PI) * -1.4
    }
  })

  let changed = false;
  Object.keys(cars).forEach((key)=>{
    const car = cars[key];
    if (car.vel != 0 || car.rotating != 0) changed = true;

    if (car.vel > 0) {
      car.vel -= (keys[key] && (keys[key][65] || keys[key][83]) ? car.fr/2 : car.fr);
      //car.vel -= car.fr
      
      if (car.vel < 0) car.vel = 0;
    }

    if (car.vel < 0) {
      car.vel += (keys[key] && (keys[key][65] || keys[key][83]) ? car.fr/2 : car.fr);
      //car.vel += car.fr
      if (car.vel > 0) car.vel = 0;
    }

    car.orientation.pos.x += Math.sin(toRads(car.orientation.rot.y)) * car.vel;
    car.orientation.pos.z += Math.cos(toRads(car.orientation.rot.y)) * car.vel;

    const forwardCoords = {
      x: car.orientation.pos.x + Math.sin(toRads(car.orientation.rot.y))*0.8,
      z: car.orientation.pos.z + Math.cos(toRads(car.orientation.rot.y))*0.8
    }

    mappedCords.forEach((otherCar)=>{
      if (otherCar.key === key || otherCar.inmortal || car.bumped) return;
      const dist = Math.sqrt((forwardCoords.x - otherCar.x)**2 + (forwardCoords.z - otherCar.z)**2);

      if (dist < 1.5) {
        let key = otherCar.key;
        cars[otherCar.key].orientation.rot.z = 160;
        cars[otherCar.key].orientation.pos.y = 1.6;
        cars[key].bumped = true;
        cars[key].inmortal = true;
        cars[key].acc = 0;
        car.knockouts += 1;
        car.acc = 0;
        car.vel = -0.06;
        setTimeout(()=>{
          cars[otherCar.key].orientation.rot.z = 0;
          cars[otherCar.key].orientation.pos.y = 0;
          cars[key].bumped = false;
        }, 4000)
        setTimeout(()=>{
          cars[key].inmortal = false;

        }, 6000)
      }
    })
  })
  return changed;
}

io.on("connection",socket => {

  const {name, spectator} = socket.handshake.query;
  console.log(`Se unio ${name}! (${socket.id}). ${spectator} ${spectator == "true" ? "Se trata de un espectador. " : ""}`);

  if (spectator == "true")  {
    return;
    socket.emit("tick", cars)

  }

  socket.on("identification", ()=> {
    console.log("identification: ",socket.id)
    io.to(socket.id).emit("identification", socket.id)
  })

  cars[socket.id] = new Car(name);
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

    if (car.bumped) return;

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