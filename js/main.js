let isUpKeyDown = false;
let gravityPull = 2;
let gravityIncreaseRate = 0;
let planeRotationFactor = 0.5;
let maxFuel = 2000;
let fuel = maxFuel;
let groundLimit; // will init in main;
let skyLimit = 20;

let fuelBurnRate = 1;
let fuelUpBurnRate = 4;

let bulkGoldProbability = 20;
let fuelProbability = 5;
let bulkFuelProbability = 1;
let magnetProbability = 2;

let coinValue = 1;
let bulkCoinValue = 5;
let fuelValue = 200;
let bulkFuelValue = 600;

let coinSpeed = 3000;
let coinFrequency = 200;

let pathPosition = 500;
let pathDirectionLength = 1;
let pathDirection = -1; // 1 is down and -1 is up. and zero is straight
let pathPositionDisplacement = 25;
let pathStackDistance = 45;

let score = 0;
const stackLimit = 3;
const haveStackProbability = 30; // percent

let bonusRegion;

//Constant Element
let plane;
let game;
let fuelBar;
let scoreCard;
let loop;

const addCloud = function(){
  const cloud = $('.hidden .cloud:first').clone();
  const gameBoard = game;
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
function setCoinPathDirection(direction){
  if (pathDirection !== direction){
    directionCount = 0
  }
  pathDirection = (pathDirection === 0) ? direction : 0;
}
const addCoinToPath = function(){

  const gameBoard = game;

  const img = getCoinFuelOnProbability(true);

  // If path incremental or decremental direction is more
  // then Direction Length only then change the direction
  if( directionCount > pathDirectionLength){
    // change the path
    const randInt = getRandomInt(3);
    if(randInt === 1) {
      setCoinPathDirection(1);
    } else if (randInt === 2) {
      setCoinPathDirection(-1);
    } else {
      setCoinPathDirection(0);
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
  gameBoard.append(coinArray);

  $.each(coinArray, function(i, ele){
    $(ele).animate({left: '-=850'}, coinSpeed, 'linear', function(){this.remove()});
  });
};

function getCoinFuelOnProbability(isPath){
  const addBulkGoldOnPath = (Math.random() * 100) < bulkGoldProbability;
  const addFuelWithPath = (Math.random() * 100) < fuelProbability;
  const addBulkFuelWithPath = (Math.random() * 100) < bulkFuelProbability;
  const magnetWithPath = (Math.random() * 100) < magnetProbability;
  let img;

  if( addBulkGoldOnPath ){
    img = $('.hidden .coins:first').clone();
  } else if( addFuelWithPath && !isPath){
    img = $('.hidden .fuel:first').clone();
  } else if( magnetWithPath && !isPath ){
    img = $('.hidden .magnet:first').clone();
  } else if( addBulkFuelWithPath && !isPath ){
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
  let planeLeft = plane.position().left;
  let planeWidth = plane.outerWidth();
  let aboutToCollideElements = game.find(".coin, .coins, .fuel, .fuels, .magnet").not('.collected').filter(function(){
    return $(this).position().left > planeLeft && $(this).position().left <= (planeLeft + planeWidth) ;
  });

  aboutToCollideElements.each(function(i, ele){
    ele = $(ele);
    if( collidesWithPlane(ele) ){
      if(ele.is('.magnet')){
        magnetCaptured()
      } else {
        animateTowardsPlane(ele);
      }
    }
  });
}
function setScoreCard(){
  scoreCard.text(score);
}

function showNewGamePopup() {
  const dlg = $('#game-over-dlg');
  dlg.find('#modal-score').text(score);
  dlg.modal();
}

// 0 means going straight
// -1/1 partial up/down
// -2/2 full up/down --> it will depend on this variable.
const planeGoUpDownLimit = 5;
// minus means plane is going up;
let planeDirection = 0;
let incrementalInterval = 1;
let incrementalIntervalCount = 0;
const planeFlight = function(){
  let top = parseInt(plane.css('top'), 10);
  if( fuel > 0 && isUpKeyDown ){
    fuel -= fuelUpBurnRate;
    if (planeDirection !== -(planeGoUpDownLimit)){
      if(++incrementalIntervalCount === incrementalInterval){
        planeDirection-=planeRotationFactor;
        incrementalIntervalCount = 0;
      }
    }
  } else {
    fuel -= fuelBurnRate;
    if(top >= groundLimit){
      // The plane is on the ground
      if(planeDirection !== 0){planeDirection-=planeRotationFactor}
    } else {
      if (planeDirection !== planeGoUpDownLimit) {
        if (++incrementalIntervalCount === incrementalInterval) {
          planeDirection += planeRotationFactor;
          incrementalIntervalCount = 0;
        }
      }
    }
  }
  top += planeDirection;
  let degrees = Math.floor(planeDirection) * 5;
  plane.css({
    'top': top,
    'transform': 'rotate('+ degrees +'deg)'
  });
}
jQuery.fn.rotate = function(degrees) {
  $(this).css({'transform' : 'rotate('+ degrees +'deg)'});
  return $(this);
};
const gameLoop = function(){
  planeFlight();
  scrollToCenter($('#screen'), plane);
  setFill(fuelBar, Math.floor((fuel/maxFuel) * 100), true );
  collectCoins();
  if(fuel <= 0 && plane.position().top >= groundLimit){
    showNewGamePopup();
    clearInterval(loop);
  }
}

$(document).ready(function(){
  plane = $('#plane');
  game = $('#game');
  fuelBar = $('#fuel-bar');
  scoreCard = $('#score-card');
  groundLimit = (game.outerHeight() - 75);

  setInterval(addCloud, 6000);
  addCloud();

  setInterval(addCoinToPath, coinFrequency);
  addCoinToPath();

  $('body').on("mousedown touchstart", function(e){
    isUpKeyDown = true;
    gravityIncreaseRate = 0;
  }).on("mouseup touchend", function(e){
    isUpKeyDown = false;
  });
  loop = setInterval(gameLoop, 40);
  gameLoop();
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
  ele = $(ele).addClass('collected');
  ele.stop(true);
  let destinationPosition = scoreCard.position();
  if(ele.is('.fuel, .fuels')){
    destinationPosition = fuelBar.position();
  }
  //let planePosition = plane.position();
  ele.animate({
    top: destinationPosition.top,
    left: destinationPosition.left
  }, 800, 'swing', function (){
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
  setScoreCard();
};

const magnetCaptured = function(){
  game.find('.coin, .coins, .fuels, .fuel, .magnet').stop().each(function(i, ele){
    animateTowardsPlane(ele);
  });
}

const scrollToCenter = function(container, element){
  let $parentDiv = $(container);
  let $innerItem = $(element);
  $parentDiv.animate({
    scrollTop: ($innerItem.position().top - ($parentDiv.innerHeight()/2 - $innerItem.innerHeight()/2))
  }, 30, 'linear');
}



