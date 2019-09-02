источники
https://jsfiddle.net/web3r/auLszh9f/embedded/result,js/?bodyColor=f9f9f9&amp;accentColor=6f7f87&amp;menuColor=fff&amp;fontColor=6f7f87#JavaScript


https://web3r.ru/swipe-event















/**
 * Object.assign() polyfill
 */
Object.assign||Object.defineProperty(Object,"assign",{enumerable:!1,configurable:!0,writable:!0,value:function(a,b){"use strict";if(void 0===a||null===a)error("Cannot convert first argument to object");for(var c=Object(a),d=1;d<arguments.length;d++){var e=arguments[d];if(void 0!==e&&null!==e)for(var f=Object.keys(Object(e)),g=0,h=f.length;g<h;g++){var i=f[g],j=Object.getOwnPropertyDescriptor(e,i);void 0!==j&&j.enumerable&&(c[i]=e[i])}}return c}});

/**
 * CustomEvent() polyfill
 */
!function(){if("function"==typeof window.CustomEvent)return;function t(t,e){e=e||{bubbles:!1,cancelable:!1,detail:void 0};var n=document.createEvent("CustomEvent");return n.initCustomEvent(t,e.bubbles,e.cancelable,e.detail),n}t.prototype=window.Event.prototype,window.CustomEvent=t}();


/**
 * Функция определения события swipe на элементе.
 * @param {Object} el - элемент DOM.
 * @param {Object} settings - объект с предварительными настройками.
 */
var swipe = function(el, settings) {

  // настройки по умолчанию
  var settings = Object.assign({}, {
    minDist: 60,  // минимальная дистанция, которую должен пройти указатель, чтобы жест считался как свайп (px)
    maxDist: 120, // максимальная дистанция, не превышая которую может пройти указатель, чтобы жест считался как свайп (px)
    maxTime: 700, // максимальное время, за которое должен быть совершен свайп (ms)
    minTime: 50   // минимальное время, за которое должен быть совершен свайп (ms)
  }, settings);

  // коррекция времени при ошибочных значениях
  if (settings.maxTime < settings.minTime) settings.maxTime = settings.minTime + 500;
  if (settings.maxTime < 100 || settings.minTime < 50) {
    settings.maxTime = 700;
    settings.minTime = 50;
  }

  var el = this.el,       // отслеживаемый элемент
    dir,                  // направление свайпа (horizontal, vertical)
    swipeType,            // тип свайпа (up, down, left, right)
    dist,                 // дистанция, пройденная указателем
    isMouse = false,      // поддержка мыши (не используется для тач-событий)
    isMouseDown = false,  // указание на активное нажатие мыши (не используется для тач-событий)
    startX = 0,           // начало координат по оси X (pageX)
    distX = 0,            // дистанция, пройденная указателем по оси X
    startY = 0,           // начало координат по оси Y (pageY)
    distY = 0,            // дистанция, пройденная указателем по оси Y
    startTime = 0,        // время начала касания
    support = {           // поддерживаемые браузером типы событий
      pointer: !!("PointerEvent" in window || ("msPointerEnabled" in window.navigator)),
      touch: !!(typeof window.orientation !== "undefined" || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window || navigator.msMaxTouchPoints || "maxTouchPoints" in window.navigator > 1 || "msMaxTouchPoints" in window.navigator > 1)
    };

  /**
   * Опредление доступных в браузере событий: pointer, touch и mouse.
   * @returns {Object} - возвращает объект с доступными событиями.
   */
  var getSupportedEvents = function() {
    switch (true) {
      case support.pointer:
        events = {
          type:   "pointer",
          start:  "PointerDown",
          move:   "PointerMove",
          end:    "PointerUp",
          cancel: "PointerCancel",
          leave:  "PointerLeave"
        };
        // добавление префиксов для IE10
        var ie10 = (window.navigator.msPointerEnabled && Function('/*@cc_on return document.documentMode===10@*/')());
        for (var value in events) {
          if (value === "type") continue;
          events[value] = (ie10) ? "MS" + events[value] : events[value].toLowerCase();
        }
        break;
      case support.touch:
        events = {
          type:   "touch",
          start:  "touchstart",
          move:   "touchmove",
          end:    "touchend",
          cancel: "touchcancel"
        };
        break;
      default:
        events = {
          type:  "mouse",
          start: "mousedown",
          move:  "mousemove",
          end:   "mouseup",
          leave: "mouseleave"
        };
        break;
    }
    return events;
  };


  /**
   * Объединение событий mouse/pointer и touch.
   * @param e {Event} - принимает в качестве аргумента событие.
   * @returns {TouchList|Event} - возвращает либо TouchList, либо оставляет событие без изменения.
   */
  var eventsUnify = function(e) {
    return e.changedTouches ? e.changedTouches[0] : e;
  };


  /**
   * Обрабочик начала касания указателем.
   * @param e {Event} - получает событие.
   */
  var checkStart = function(e) {
    var event = eventsUnify(e);
    if (support.touch && typeof e.touches !== "undefined" && e.touches.length !== 1) return; // игнорирование касания несколькими пальцами
    dir = "none";
    swipeType = "none";
    dist = 0;
    startX = event.pageX;
    startY = event.pageY;
    startTime = new Date().getTime();
    if (isMouse) isMouseDown = true; // поддержка мыши
    e.preventDefault();
  };

  /**
   * Обработчик движения указателя.
   * @param e {Event} - получает событие.
   */
  var checkMove = function(e) {
    if (isMouse && !isMouseDown) return; // выход из функции, если мышь перестала быть активна во время движения
    var event = eventsUnify(e);
    distX = event.pageX - startX;
    distY = event.pageY - startY;
    if (Math.abs(distX) > Math.abs(distY)) dir = (distX < 0) ? "left" : "right";
    else dir = (distY < 0) ? "up" : "down";
    e.preventDefault();
  };

  /**
   * Обработчик окончания касания указателем.
   * @param e {Event} - получает событие.
   */
  var checkEnd = function(e) {
    if (isMouse && !isMouseDown) { // выход из функции и сброс проверки нажатия мыши
      mouseDown = false;
      return;
    }
    var endTime = new Date().getTime();
    var time = endTime - startTime;
    if (time >= settings.minTime && time <= settings.maxTime) { // проверка времени жеста
      if (Math.abs(distX) >= settings.minDist && Math.abs(distY) <= settings.maxDist) {
        swipeType = dir; // опредление типа свайпа как "left" или "right"
      } else if (Math.abs(distY) >= settings.minDist && Math.abs(distX) <= settings.maxDist) {
        swipeType = dir; // опредление типа свайпа как "top" или "down"
      }
    }
    dist = (dir === "left" || dir === "right") ? Math.abs(distX) : Math.abs(distY); // опредление пройденной указателем дистанции

    // генерация кастомного события swipe
    if (swipeType !== "none" && dist >= settings.minDist) {
      var swipeEvent = new CustomEvent("swipe", {
          bubbles: true,
          cancelable: true,
          detail: {
            full: e, // полное событие Event
            dir:  swipeType, // направление свайпа
            dist: dist, // дистанция свайпа
            time: time // время, потраченное на свайп
          }
        });
      el.dispatchEvent(swipeEvent);
    }
    e.preventDefault();
  };

  // добавление поддерживаемых событий
  var events = getSupportedEvents();

  // проверка наличия мыши
  if ((support.pointer && !support.touch) || events.type === "mouse") isMouse = true;

  // добавление обработчиков на элемент
  el.addEventListener(events.start, checkStart);
  el.addEventListener(events.move, checkMove);
  el.addEventListener(events.end, checkEnd);

};


/** 
 * Примеры работы swipe()
 */
var getExampleDiv = function(id) {
  return document.getElementById("example-" + id);
};

var makeDone = function(el, currentDir, dirs) {
  if (dirs.indexOf(currentDir) > -1) {
    el.classList.add("swiped");
    el.querySelector(".swipe-block-text").textContent = "сделан свайп (" + currentDir + ")";
  }
};

var examples = {
  simpleLeft: {
    el: getExampleDiv("simple-one"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "left");
    }
  },
  simpleRight: {
    el: getExampleDiv("simple-two"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "right");
    }
  },
  simpleUpDown: {
    el: getExampleDiv("simple-three"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "up down");
    }
  },
  distRight: {
    el: getExampleDiv("dist-one"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "right");
      console.log({
        "Дистанция": e.detail.dist,
        "Направление": e.detail.dir,
        "Полное событие": e.detail.full
      });
    },
    set: {
      minDist: 180,
      maxDist: 250
    }
  },
  distLeft: {
    el: getExampleDiv("dist-two"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "left");
      console.log({
        "Дистанция": e.detail.dist,
        "Направление": e.detail.dir,
        "Полное событие": e.detail.full
      });
    },
    set: {
      minDist: parseInt((getExampleDiv("dist-two").clientWidth / 2).toFixed(), 10),
      maxDist: parseInt(getExampleDiv("dist-two").clientWidth.toFixed(), 10)
    }
  },
  timeDown: {
    el: getExampleDiv("timeout-one"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "down");
      console.log({
        "Время на свайп": e.detail.time,
      });
    },
    set: {
      minTime: 750,
      maxTime: 1750
    }
  },
  timeLeft: {
    el: getExampleDiv("timeout-two"),
    callback: function(e) {
      makeDone(e.target, e.detail.dir, "left");
      console.log({
        "Время на свайп": e.detail.time,
      });
    },
    set: {
      maxTime: 175,
      minTime: 50
    }
  }
};

for (var example in examples) {
  var el = examples[example].el;
  swipe(el, examples[example].set);
  el.addEventListener("swipe", examples[example].callback);
}