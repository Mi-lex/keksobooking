/* eslint max-statements: ["error", 200, { "ignoreTopLevelFunctions": true }]*/
/* eslint linebreak-style: ["error", "unix"] */
/* eslint max-len: ["error", { "code": 200 }] */

'use strict';

(function random() {
  window.getRandItem = function getRandItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  window.getRandInt = function getRandInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  window.getRandRgbaColor = function getRandRgbaColor() {
    return `rgba(${window.getrandInt(0, 255)}, ${window.getrandInt(0, 255)}, ${window.getrandInt(0, 255)}`;
  }
}());

(function mapCardRender() {
  var url = 'https://js.dump.academy/keksobooking/data';

  function renderMapCards(mapCardList) {
    var fragment = document.createDocumentFragment(),
        similarMapCardTemplate = document.querySelector('template').content.
      querySelector('.map__card');
    window.map = document.querySelector('.map');

    mapCardList.forEach((el) => {
      var mapCardItem = similarMapCardTemplate.cloneNode(true);
      mapCardItem.querySelector('h3').textContent = el.offer.title;
      mapCardItem.querySelector('h3 ~ p').textContent = el.offer.address;
      mapCardItem.querySelector('.popup__price').innerHTML =
        `${el.offer.price}&#x20bd;/ночь`;
      mapCardItem.querySelector('h4').textContent = el.offer.type;
      mapCardItem.querySelector('h4 ~ p').textContent = `${el.offer.rooms} для ${el.offer.guests}`;
      mapCardItem.querySelector('h4 ~ p ~ p').textContent = `Заезд после ${el.offer.checkin} выезд до ${el.offer.checkout}`;

      mapCardItem.querySelector('.popup__features').innerHTML = '';
      el.offer.features.forEach((featureName) => {
        var featureItem = document.createElement('LI');
        featureItem.classList.add(`feature`);
        featureItem.classList.add(`feature--${featureName}`);
        mapCardItem.querySelector('.popup__features').appendChild(featureItem);
      });

      mapCardItem.querySelector('.popup__features ~ p').textContent = el.offer.description;
      mapCardItem.querySelector('.popup__avatar').setAttribute('src', el.author.avatar);
      mapCardItem.classList.add('hidden');
      mapCardItem.setAttribute('data-pinlocation', `${el.location.x}, ${el.location.y}`);
      fragment.appendChild(mapCardItem);
    });

    window.map.appendChild(fragment);
  }

  function onError(message) {
    console.error(message);
  }

  function onSuccess(mapCardList) {
    renderMapCards(mapCardList);
    mapPinRender();
    mapFeaturesHandlers();
  }

  window.load(url, onSuccess, onError);
}());

function mapPinRender() {
  var mapCardList = window.map.querySelectorAll('.map__card'),
      mapPinsContainer = window.map.querySelector('.map__pins');

  function renderMapPins() {
    var fragment = document.createDocumentFragment(),
        similarMapPinItem = document.querySelector('template').content.
          querySelector('.map__pin');

    mapCardList.forEach((el, i) => {
      var mapPin = similarMapPinItem.cloneNode(true),
          mapPinIcon = mapPin.querySelector('img'),
          pinCoords = el.getAttribute('data-pinlocation').split(', '),
          pinAvatar = el.querySelector('img').getAttribute('src');
      mapPin.style.left = `${pinCoords[0] - mapPinIcon.style.width / 2}px`;
      mapPin.style.top = `${pinCoords[1] - mapPinIcon.style.height}px`;
      mapPin.classList.add('hidden');
      mapPin.setAttribute('data-popup-card', i);
      mapPinIcon.setAttribute('src', pinAvatar);
      fragment.appendChild(mapPin);
    });

    mapPinsContainer.appendChild(fragment);
  }

  renderMapPins();
}

function mapFeaturesHandlers() {
    var mapCardList = window.map.querySelectorAll('.map__card');

  function showPopUpCard(cardNumb, mapPin) {
    closePopupCard();
    mapPin.classList.add('map__pin--active');
    mapCardList[cardNumb].classList.remove('hidden');
  }

  function closePopupCard() {
    if (window.map.querySelector('.map__pin--active')) {
      window.map.querySelector('.map__pin--active').classList.remove('map__pin--active');
    }
    mapCardList.forEach((el) => {
      el.classList.add('hidden');
    });
  }

  function onMapClickHandler(e) {
    if (e.target.closest('.map__pin') && !e.target.closest('.map__pin--main')) {
      let currentMapPin = e.target.closest('.map__pin'),
      cardNumb = e.target.closest('.map__pin').getAttribute('data-popup-card');
      showPopUpCard(cardNumb, currentMapPin);
    }

    if (e.target.closest('.popup__close')) {
      closePopupCard();
    }
  }

  window.map.addEventListener('click', onMapClickHandler);
}

(function mainPinHanlder() {
  var mapMainPin = window.map.querySelector('.map__pin--main'),
      noticeForm = document.querySelector('.notice__form'),
      addressInput = noticeForm.querySelector('#address');

  window.getElemCoords = function getElemCoords(elem) {
    var coordsObj = elem.getBoundingClientRect();

    return {
      left: coordsObj.left,
      top: coordsObj.top
    }
  }

  function activeMap() {
    window.map.classList.remove('map--faded');
    window.map.querySelectorAll('.map__pin').forEach((el) => {
      el.classList.remove('hidden');
    });
    mapMainPin.addEventListener('mousedown', onMainPinMousedownHandler);
  }

  function activeForm() {
    noticeForm.classList.remove('notice__form--disabled');
  }

  function onMainPinMouseupHandler() {
    activeMap();
    activeForm();
    mapMainPin.removeEventListener('mouseup', onMainPinMouseupHandler);
  }

  function onMainPinMousedownHandler (ev) {
    var mainPinCoords = window.getElemCoords(mapMainPin),
        mapCoords = window.getElemCoords(window.map),
        shift = {
          x: ev.clientX - mainPinCoords.left - mapMainPin.offsetWidth / 2,
          y: ev.clientY - mainPinCoords.top - mapMainPin.offsetHeight / 2
        };
    mapMainPin.style.position = 'absolute';
    mapMainPin.style.zIndex = 10;

    function movePinAt(moveEvent) {
      var newPinCoords = {
        left: moveEvent.clientX - mapCoords.left - shift.x,
        top: moveEvent.clientY - mapCoords.top - shift.y
      },
          rightEdge = window.map.offsetWidth,
          bottomEdge = 650;

      if (newPinCoords.left > rightEdge) {
        newPinCoords.left = rightEdge;
      } else if (newPinCoords.left < 50) {
          newPinCoords.left = 50;
      }

      if (newPinCoords.top > bottomEdge) {
        newPinCoords.top = bottomEdge;
      } else if (newPinCoords.top < 100) {
        newPinCoords.top = 100;
      }

      mapMainPin.style.left = `${newPinCoords.left}px`;
      mapMainPin.style.top = `${newPinCoords.top}px`;
      addressInput.value = `x: ${newPinCoords.left}, y: ${newPinCoords.top - 50}`;
    }

    function onDocMousemoveHandler(moveEvent) {
      movePinAt(moveEvent);
    }

    function onDocMouseupHandler() {
      document.removeEventListener('mousemove', onDocMousemoveHandler);
      document.onmouseup = null;
    }

    document.addEventListener('mousemove', onDocMousemoveHandler);
    document.onmouseup = onDocMouseupHandler;
  }

  mapMainPin.addEventListener('mouseup', onMainPinMouseupHandler);
}());
