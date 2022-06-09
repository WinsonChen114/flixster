const searchAreaQS = document.querySelector("#search-area")
const searchInputQS = document.querySelector("#search-input")
const movieGridQS = document.querySelector("#movie-grid")
const moreButtonQS = document.querySelector("#load-more-movies-btn")
const searchTitleQS = document.querySelector("#search-title")
const nowPlayingQS = document.querySelector("#now-playing")
const exitSearchQS = document.querySelector("#exit-search")


const apiKey = ""
let page = 1
//base url for images
const base = "https://image.tmdb.org/t/p/original"
//Text from search box
let searchInput = ""

//Checks if user searches for a movie
searchAreaQS.addEventListener("submit", handleFormSubmit)
//Exiting Search
exitSearchQS.addEventListener("click", exitSearch)
moreButtonQS.addEventListener("click", loadMore)


//Gets currently playing movies
async function loadCurrentlyPlaying(event) {
    event.preventDefault()
    let response = await fetch("https://api.themoviedb.org/3/movie/now_playing?api_key=" + apiKey + "&language=en-US&page=" + page)
    // console.log("response is: ")
    // console.log(response)

    let responseData = await response.json()
    // console.log("responseData is: ")
    // console.log(responseData)

    displayResults(responseData.results)
    addEventListenerToCards()

    page++
}

//When searches for a certain movie from the API
async function searchResults() {
    searchInput = searchInputQS.value
    // console.log("searchInput is: " + searchInput)

    //Changing the titles when searching for movies
    searchTitleQS.classList.remove("hidden")
    exitSearchQS.classList.remove("hidden")
    searchTitleQS.innerHTML = `
    Searching for: "${searchInput}"
    `
    nowPlayingQS.classList.add("hidden")


    let response = await fetch("https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&language=en-US&query=" + searchInput + "&page=" + page + "&include_adult=false")
    // console.log("response is: ")
    // console.log(response)

    let responseData = await response.json()
    // console.log("responseData is: ")
    // console.log(responseData)


    //If there are movies to display, display them
    if (responseData.results.length != 0) {
        displayResults(responseData.results)
    }
    //else, let the user know that there are no movies
    else {
        movieGridQS.innerHTML = `
        <h2>No results for</h2>
        <h2>"${searchInput}"</h2>
        <h2>Please try another search term</h2>`
    }

    addEventListenerToCards()

    page++

}

//Display results from an array
function displayResults(results) {
    //Adds each movie in the array
    results.forEach((movie, index) => {
        movieGridQS.innerHTML += `
        <div class = "movie-card" id = "${((page - 1) * 20) + index}">
            <img src = ${base + movie.poster_path} class = movie-poster alt = "${movie.original_title}" title = "${movie.original_title}" width = 100% height = auto>
            <p class = "movie-title">${movie.title}</p>
            <p class = "movie-votes ${voteIdSelect(movie.vote_average)}">${movie.vote_average}/10</p>
        </div>
        `
    })
}

//Executes code when a user searches for a movie
function handleFormSubmit(event) {

    event.preventDefault()
    //clears page for new movies
    if (movieGridQS) {
        movieGridQS.innerHTML = ''
    }
    //reset page number
    page = 1;

    searchResults()
}

//Exits search and shows currently playing movies again
function exitSearch(event) {
    //Changing the titles when exiting search
    searchTitleQS.classList.add("hidden")
    exitSearchQS.classList.add("hidden")
    nowPlayingQS.classList.remove("hidden")

    //clears page for new movies
    movieGridQS.innerHTML = ''
    searchInputQS.value = ''

    //reset page number
    page = 1;

    loadCurrentlyPlaying(event)
}

//Loads more results
function loadMore(event) {
    //If in search mode
    if (!(searchTitleQS.classList.contains("hidden"))) {
        searchResults()
    }
    //If in currently playing mode
    else {
        loadCurrentlyPlaying(event)
    }
}

//Returns a ID depending on if the rating for a mvie is high, medium, or low
//style.css will then use the id to assign the rating a color
function voteIdSelect(rating) {
    if (rating >= 8) {
        return "high"
    }
    else if (rating >= 6.5) {
        return "medium"
    }
    else {
        return "low"
    }
}

//Displayes popup with more information on a movie
async function displayPopup(card) {
    console.log("Clicked")
    console.log(card.id)

    //Reverse Engineer the page num and index from the id of the card
    let index = (card.id) % 20
    let pageNum = (card.id - index) / 20 + 1

    console.log("pageNum: " + pageNum)
    console.log("index: " + index)

    //Fetch more data from the API
    let response
    //If in search mode
    if (!(searchTitleQS.classList.contains("hidden"))) {
        response =  await fetch("https://api.themoviedb.org/3/search/movie?api_key=" + apiKey + "&language=en-US&query=" + searchInput + "&page=" + pageNum + "&include_adult=false")
    }
    //If in currently playing mode
    else {
        response =  await fetch("https://api.themoviedb.org/3/movie/now_playing?api_key=" + apiKey + "&language=en-US&page=" + pageNum)
    }

    responseData = await response.json()
    console.log(responseData)

}

//Adds event listeners to cards
function addEventListenerToCards() {
    const movieCardQS = document.querySelectorAll(".movie-card")
    // console.log(movieCardQS.length)
    movieCardQS.forEach(card => {
        card.addEventListener("click", () => displayPopup(card))
        // console.log("Added")
    })
}

//Finds currently playing movies when page loads
window.onload = loadCurrentlyPlaying
