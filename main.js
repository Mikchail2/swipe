// PointerEvent =>(MouseEvent, TouchEvent)
// dispatchEvent() ?
// CustomEvent contains details

 class Swipe {

  constructor(el, settings) {
    this.settings = {
      minDist: 60,
      maxDist: 120,
      maxTime: 700,
      minTime: 50,
      ...settings,
    };
    this.el = el;
    if (this.settings.maxTime < this.settings.minTime) {
      this.settings.maxTime = this.settings.minTime + 500;
    }
    if (this.settings.maxTime < 100 || this.settings.minTime < 50) {
      this.settings.maxTime = 700;
      this.settings.minTime = 50;
    }
    
    
    this.dir;
    this.swipeType;
    this.distance;
    this.isMouse = false;
    this.isMouseDown = false;
    this.startX = 0;
    this.distanceX = 0;
    this.startY = 0;
    this.distanceY = 0;
    this.startTime = 0;
    this.support = {
      pointer: !!("PointerEvent" in window ||  ("msPointerEnabled" in window.navigator)),
      touch: !!(typeof window.screen.orientation !== "undefined" || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      "ontouchstart" in window || navigator.msMaxTouchPoints || "maxTouchPoints" in window.navigator > 1 || 'msMaxTouchPoints' in window.navigator > 1),
    };
    this.init();
  }

  eventsUnify =(e) => {
       return e.changedTouches ? e.changedTouches[0] : e;
  };
 
  getSupportedEvent () {
    
    
    var events;
    
    switch (true) {
      case this.support.pointer:
        events = {
          type: "pointer",
          start: "pointerdown",
          move: "pointermove",
          end: "pointerup",
          cancel: "pointercancel",
          leave: "pointerleave",
        };
        break;
      case this.support.touch:
        events = {
          type: "touch",
          start: "touchstart",
          move: "touchmove",
          end: "touchend",
          cancel: "touchcancel",
        }
        break;
      default:
        events = {
          type: "mouse",
          start: "mousedown",
          move: "mousemove",
          end: "mouseup",
          leave: "mouseleave",
        }
        break;
    }
    return events;
  }
  

  checkStart(e)  {
    
    var event = this.eventsUnify(e);
    
    if (this.support.touch && typeof e.touch !== "undefined" && e.touch.length !== 1) {
      return;
    }
    this.dir = "none";
    this.swipeType = "none";
    this.distance = 0;
    this.startY = event.pageY;
    this.startX = event.pageX;
    
    
    this.startTime = new Date().getTime();
    if (this.isMouse) {
      this.isMouseDown = true;

    }
    e.preventDefault();

  }

  checkMove(e) {
    if (this.isMouse && !this.isMouseDown) {
      return;
    }
    var event = this.eventsUnify(e);
    this.distanceX = event.pageX - this.startX;
    this.distanceY = event.pageY - this.startY;
    if (Math.abs(this.distanceX) > Math.abs(this.distanceY)) {
      this.dir = (this.distanceX < 0) ? "left" : "right";

    } else {
      this.dir = (this.distanceY < 0) ? "up" : "down";
    }
    e.preventDefault();

  }

  checkEnd(e) {
    if (this.isMouse && !this.isMouseDown) {
      this.isMouseDown = false;
      return;
    }
    var endTime = new Date().getTime();
    var time = endTime - this.startTime;

    if (time >= this.settings.minTime && time <= this.settings.maxTime) {
      if (Math.abs(this.distanceX) >= this.settings.minDist && Math.abs(this.distanceY) <= this.settings.maxDist) {
        this.swipeType = this.dir;
      } else if (Math.abs(this.distanceY) >= this.settings.minDist && Math.abs(this.distanceX) <= this.settings.maxDist) {
        this.swipeType = this.dir;
      }
    }
    this.distance = (this.dir === "left" || this.dir === "right") ? Math.abs(this.distanceX) : Math.abs(this.distanceY);
    if (this.swipeType !== "none" && this.distance >= this.settings.minDist) {
      var swipeEvent = new CustomEvent("swipe", {
        bubbles: true,
        cancelable: true,
        detail: {
          full: e,
          dir: this.swipeType,
          dist: this.distance,
          time: time,
        }
      });
      this.el.dispatchEvent(swipeEvent);
    }
    e.preventDefault();
  }

  init() {
 
    
    var events = this.getSupportedEvent();
  
    if ((this.support.pointer && !this.support.touch) || events.type === "mouse") {
      this.isMouse = true;
     
      
      
    }
   
    this.el.addEventListener(events.start, this.checkStart.bind(this));
    this.el.addEventListener(events.move, this.checkMove.bind(this));
    this.el.addEventListener(events.end, this.checkEnd.bind(this));
  }

}

var elem = document.getElementById('elem');
elem.addEventListener('PointerDown',function(){
  console.log(1);
  
})
var swipe = new Swipe(elem,{});
console.dir(swipe.eventsUnify);
var makeDone = function(el, currentDir, dirs) {
  if (dirs.indexOf(currentDir) > -1) {
    console.log(el, currentDir, dirs);
    
    el.classList.add("swiped");
    el.textContent = "сделан свайп (" + currentDir + ")";
  }
};
elem.addEventListener('swipe',(e)=>{
console.log(1);

  makeDone(e.target, e.detail.dir, "left");
  
})

// simpleLeft: {
//   el: getExampleDiv("simple-one"),
//   callback: function(e) {
//     makeDone(e.target, e.detail.dir, "left");
//   }

