const filterInput = document.getElementById('filter');
filterInput.addEventListener('input', fetchAutoComplete);

const cardList = document.querySelector('.cardlist');
const favs = document.getElementById('favs');

const cardListContainer = document.getElementById('filtered-container');
const favsContainer = document.getElementById('favs-container');
const detailsContainer = document.getElementById('details');


//Pass user input through autocomplete API to generate 20 cards
let timeOut = 0;
function fetchAutoComplete() {
  clearTimeout(timeOut);
  timeOut = setTimeout(function () {
    cardList.innerHTML = ``;
    fetch(`https://api.scryfall.com/cards/autocomplete?q=${filterInput.value}`)
    .then(res => res.json())
    .then(res => getCardImages(res.data))
  }, 100);
};

//Get the image of each card generated
function getCardImages(cards) {
  cards.forEach(element => {
    fetch(`https://api.scryfall.com/cards/named?fuzzy=${element}`)
    .then(res => res.json())
    .then(card => {
      const img = document.createElement("img");
      img.src = card['image_uris'].normal;
      img.className = "cardImage";
      cardList.append(img);
      img.addEventListener('click', (e) => showDisplay(card, e))
      document.querySelector('#filtered-default-text').textContent = 'Results:'
    })
    .catch(err => console.log(err));
    document.querySelector("#details-oracletext").style.display = 'block';
  });
};

//Load favorites list on page load
function renderFavorites() {
  fetch(`http://localhost:3000/favorites`)
  .then(res => res.json())
  .then(arr => arr.map(card => {
    // console.log(card)
    const img = document.createElement("img");
    img.src = card['image_uris'].normal;
    img.className = "cardImage";
    img.id = card.id;
    favs.append(img);
    img.addEventListener('click', () => showDisplay(card));
    img.addEventListener('click', handleDelete);
    document.querySelector('#favs-default-text').textContent = 'Favorites:';
    document.querySelector("#details-oracletext").style.display = 'block';
  }))
}
renderFavorites();

// current id 
let currentID;
function findID() {
  fetch('http://localhost:3000/favorites/')
  .then(resp => resp.json())
  .then(arr => {
    if (arr.length > 0){
    currentID = arr[arr.length -1].id}
    else currentID =0
  })
}
findID();

//Display cards when clicked
function showDisplay(card){
  document.querySelector('#details-image').src = card['image_uris'].normal;
  document.querySelector('#details-image').obj = card;
  document.querySelector('#details-cardname').textContent = card.name;
  document.querySelector('#details-oracletext').textContent = card.oracle_text;
  if(card.power){
    document.querySelector('#details-powertoughness').textContent = `Power: ${card.power} / Toughness: ${card.toughness}`;
  } else {
    document.querySelector('#details-powertoughness').textContent = ''
  }
  addToCartButton.style.display = 'block';
}


//Add card to favorites list when button clicked
const addToCartButton = document.querySelector('#add-to-cart')
addToCartButton.addEventListener('click', addToCart)

function addToCart(){
  const img = document.createElement("img");
  let card = document.querySelector('#details-image').obj;
  card.id = currentID +1;
  img.id = card.id;
  img.src = card['image_uris'].normal;
  img.className = "cardImage";
  img.addEventListener('click', (e) => showDisplay(card, e));
  img.addEventListener('click', handleDelete);
  favs.append(img);
  postCard(card);
  currentID++;
  document.querySelector('#favs-default-text').textContent = 'Favorites:'
}

//takes obj and posts to database
function postCard(obj){
  fetch('http://localhost:3000/favorites',{
    method: 'POST',
    headers: {
     'Content-Type': 'application/json'
    },
    body:JSON.stringify(obj)
  })
}

//button to toggle between card search and favorites list
const toggleDivsBtn = document.querySelector("#toggle-divs");
toggleDivsBtn.addEventListener('click', toggleDivs);

function toggleDivs(){
  const searchFilter = document.querySelector(".search-filter");
  if (toggleDivsBtn.textContent == 'View Favorites ⭐'){
    searchFilter.style.display = "none";
    toggleDivsBtn.textContent = 'Browse Cards 🔎';
    cardListContainer.style.display = 'none';
    cardList.style.display = 'none';
    favsContainer.style.display = 'grid';
    deleteButton.style.display ='block';
  } else {
    searchFilter.style.display = "block";
    toggleDivsBtn.textContent = 'View Favorites ⭐';
    cardListContainer.style.display = 'grid';
    cardList.style.display = 'grid';
    favsContainer.style.display = 'none';
    deleteButton.style.display ='none';
  }
}

//deletemode button
const deleteButton = document.querySelector("#delete");
deleteButton.addEventListener('click', deleteToggle);

function deleteToggle(){
  if (deleteButton.textContent == 'Enable delete mode.'){
    deleteButton.textContent = 'Disable delete mode.';
    document.querySelector("#delete-warning").style.display = 'block';
  } else {
    deleteButton.textContent = 'Enable delete mode.';
    document.querySelector("#delete-warning").style.display = 'none';
  }
}

function handleDelete(e){
  if (deleteButton.textContent == 'Disable delete mode.'){
    e.target.remove();
    deleteCard(e);
  }
}

function deleteCard(e){
  fetch(`http://localhost:3000/favorites/${e.target.id}`,{
    method: 'DELETE',
    headers: {
     'Content-Type': 'application/json'
    }
  })
}