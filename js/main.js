let isUpKeyDown = false;
let gravityPull = 2;
let gravityIncreaseRate = 0;
let maxFuel = 3000;
let fuel = maxFuel;
let groundLimit = 300;
let skyLimit = 20;

let fuelBurnRate = 1;
let fuelUpBurnRate = 3;

let bulkGoldProbability = 20;
let fuelProbability = 5;
let bulkFuelProbability = 1;

coinValue = 1;
bulkCoinValue = 5;
fuelValue = 500;
bulkFuelValue = 1500;

let pathPosition = 200;
let pathDirectionLength = 1;
let pathDirection = -1; // 1 is down and -1 is up. and zero is straight
let pathPositionDisplacement = 30;
let pathStackDistance = 35;

let score = 0;
const stackLimit = 3;
const haveStackProbability = 20; // percent

let bonusRegion;

//Constant Element
let plane;
let fuelBar;
let scoreCard;
let loop;

const addCloud = function(){
  const cloud = $('.hidden .cloud:first').clone();
  const gameBoard = $('#game');
  const top = randomNumber(0, 100);
  const zIndex = randomNumber(8, 12) ;
  const imgNumber = randomNumber(1, 3) ;

  const imageName = 'img/cloud'+imgNumber+'.png'
  cloud.attr("src", imageName);
  cloud.css({
    'top': top,
    'zIndex' : zIndex + top
  });

  gameBoard.append(cloud);

  cloud.animate({
    left: "-=850"
  }, (zIndex * 1000), "linear", function(){
    this.remove();
  });

};

function randomNumber(min, max) {
  return Math.floor( (Math.random() * (max - min) + min) );
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

let directionCount = 0;

// direction can only be 1, -1, 0
function setDirection(direction){
  if (pathDirection !== direction){
    directionCount = 0
  }
  pathDirection = (pathDirection === 0) ? direction : 0;
}
const addCoinToPath = function(){

  const gameBoard = $('#game');

  const img = getCoinFuelOnProbability();

  // If path incremental or decremental direction is more
  // then Direction Length only then change the direction
  if( directionCount > pathDirectionLength){
    // change the path
    const randInt = getRandomInt(3);
    if(randInt === 1) {
      setDirection(1);
    } else if (randInt === 2) {
      setDirection(-1);
    } else {
      setDirection(0);
    }
  }
  directionCount++;
  let newPathPosition = pathPosition + (pathDirection * pathPositionDisplacement);

  if(! (newPathPosition < groundLimit && newPathPosition > skyLimit) ){
  } else {
    pathPosition = newPathPosition;
  }

  img.css({
    'top': pathPosition
  });

  let coinArray = [];
  coinArray.push( img );
  if( (Math.random() * 100) < haveStackProbability ){
    let coinsStack = addCoinsStack();
    coinArray = coinArray.concat( coinsStack.up );
    coinArray = coinArray.concat( coinsStack.down );

  }

  if(coinArray.length > 1){
    console.log( coinArray );

  }

  gameBoard.append(coinArray);

  $.each(coinArray, function(i, ele){
    $(ele).animate({left: '-=850'},10000, 'linear', function(){this.remove()});
  });

  collectCoins();
};

function getCoinFuelOnProbability(){
  const addBulkGoldOnPath = (Math.random() * 100) < bulkGoldProbability;
  const addFuelWithPath = (Math.random() * 100) < fuelProbability;
  const addBulkFuelWithPath = (Math.random() * 100) < bulkFuelProbability;

  let img;

  if(addBulkGoldOnPath){
    img = $('.hidden .coins:first').clone();
  } else if( addFuelWithPath ){
    img = $('.hidden .fuel:first').clone();
  } else if( addBulkFuelWithPath ){
    img = $('.hidden .fuels:first').clone();
  } else {
    img = $('.hidden .coin:first').clone();
  }
  return img;
}

// generate an element on the basis of probability
// condition if bonus region max stack size.
// condition if skyLimit or groundLimit reached no stack on that side.
function addCoinsStack(){
  // few thing to consider and calculate first
  let up = [];
  let down = [];

  if(!(pathPosition < skyLimit)){
    let stackUp = getRandomInt(stackLimit);
    for(let i = 0; i < stackUp; i++){
      let img = getCoinFuelOnProbability()
      let top = pathPosition - (pathStackDistance*(i+1));
      if(!(top < skyLimit)){
        img.css({top: top});
        up.push( img );
      }
    }
  }

  if(!(pathPosition > groundLimit)){
    let stackDown = getRandomInt(stackLimit);
    for(let i = 0; i < stackDown; i++){
      let img = getCoinFuelOnProbability()
      let top = pathPosition + (pathStackDistance*(i+1));
      if(!(top > groundLimit)){
        img.css({top: top});
        down.push( img );
      }
    }
  }
  // return array of elements to be added to the game;
  return {up: up, down: down}
}


function collectCoins() {
  let aboutToCollideElements = $('#game').find(".coin, .coins, .fuel, .fuels").filter(function(){
    return $(this).position().left <= 100 && $(this).position().left > 0;
  });

  aboutToCollideElements.each(function(i, ele){
    if( collidesWithPlane(ele) ){
      animateTowardsPlane(ele);
    }
  });
}
function setScoreCard(){
  scoreCard.text(score);
}
const gravity = function(){
  let top = parseInt(plane.css('top'), 10);
  if(fuel > 0 && isUpKeyDown && top > skyLimit){
    top -= 2;
    fuel -= fuelUpBurnRate;
  } else {
    fuel -= fuelBurnRate;
    if(top <= groundLimit)
      top += gravityPull;
  }
  setFill(fuelBar, Math.floor((fuel/maxFuel) * 100), true );
  setScoreCard();
  plane.css('top', top);
  if(fuel <= 0 && top >= groundLimit){
    clearInterval(loop);
  }
}

$(document).ready(function(){
  plane = $('#plane');
  fuelBar = $('#fuel-bar');
  scoreCard = $('#score-card');

  setInterval(addCloud, 6000);
  addCloud();

  setInterval(addCoinToPath, 700);
  addCoinToPath();

  $('body').on("keydown", function(e){
    if (e.keyCode === 38) {
      isUpKeyDown = true;
      gravityIncreaseRate = 0;
    }
  }).on("keyup", function(e){
    if(e.keyCode === 38){
      isUpKeyDown = false;
    }
  });
  loop = setInterval(gravity, 20);
  gravity();
});






function setFill(el, perc, use_color) {
  let color;
  if (use_color !== true) {
    color = '#f5f5f5';
  } else {
    if (perc < 20) {
      color = '#fb2203';
    } else if (perc < 40) {
      color = '#fff037';
    } else if (perc < 60) {
      color = '#a6f807';
    } else if (perc < 80) {
      color = '#58e500';
    } else if (perc <= 100) {
      color = '#58e500';
    }
  }

  $(el)
    .css('background', '-webkit-linear-gradient(left, ' + color + ' ' + perc + '%,#ffffff ' + perc + '%)')
    .css('background', '-moz-linear-gradient(left, ' + color + ' ' + perc + '%,#ffffff ' + perc + '%)')
    .css('background', '-ms-linear-gradient(left, ' + color + ' ' + perc + '%,#ffffff ' + perc + '%)')
    .css('background', '-o-linear-gradient(left, ' + color + ' ' + perc + '%,#ffffff ' + perc + '%)')
    .css('background', 'linear-gradient(to right, ' + color + ' ' + perc + '%,#ffffff ' + perc + '%)');
}

let collidesWithPlane = function (ele){
  if(!ele){
    return false;
  }
  ele = $(ele);
  // define minimum and maximum coordinates
  let eleOff = ele.offset();
  let eleMinX = eleOff.left;
  let eleMinY = eleOff.top;
  let eleMaxX = eleMinX + ele.outerWidth();
  let eleMaxY = eleMinY + ele.outerHeight();

  let planeRectOff = plane.offset();
  let planeRectMinX = planeRectOff.left;
  let planeRectMinY = planeRectOff.top;
  let planeRectMaxX = planeRectMinX + plane.outerWidth();
  let planeRectMaxY = planeRectMinY + plane.outerHeight();

  // check for intersection
  return !(eleMinX >= planeRectMaxX ||
    eleMaxX <= planeRectMinX ||
    eleMinY >= planeRectMaxY ||
    eleMaxY <= planeRectMinY);
};

let animateTowardsPlane = function(ele) {
  if(!ele){
    return false;
  }
  ele = $(ele);
  ele.stop(true);
  let planePosition = scoreCard.position();
  if(ele.is('.fuel, .fuels')){
    planePosition = fuelBar.position();
  }
  //let planePosition = plane.position();
  ele.animate({
    top: planePosition.top,
    left: planePosition.left
  }, 200, 'linear', function (){
    let e = $(this);
    e.remove();
  });
  calculateScore(ele);
}

const calculateScore = function (ele){
  if(ele.is('.coin') ){
    score += coinValue;
  } else if(ele.is('.coins')){
    score += bulkCoinValue;
  } else if(ele.is('.fuel')){
    fuel += fuelValue;
  } else if(ele.is('.fuels')){
    fuel += bulkFuelValue;
  }
  if (fuel > maxFuel) fuel = maxFuel;
};


