const searchAreaQS = document.querySelector("#search-area")
const searchInputQS = document.querySelector("#search-input")
const movieGridQS = document.querySelector("#movie-grid")
const moreButtonQS = document.querySelector("#load-more-movies-btn")
const searchTitleQS = document.querySelector("#search-title")
const nowPlayingQS = document.querySelector("#now-playing")
const exitSearchQS = document.querySelector("#exit-search")

const apiKey = "a19e39d99902fd05af15d47024f06075"
let page = 1
//base url for images
const base = "https://image.tmdb.org/t/p/w342"
//Text from search box
let searchInput = ""

//Checks if usere searches for a movie
searchAreaQS.addEventListener("submit", handleFormSubmit)
//Exiting Search
exitSearchQS.addEventListener("click", exitSearch)

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
}

//When searches for a certain movie from the API
async function searchResults() {
    searchInput = searchInputQS.value
    console.log("searchInput is: " + searchInput)

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

    displayResults(responseData.results)

}

//Display results from an array
function displayResults(results) {
    //Adds each movie in the array
    results.forEach((movie) => {
        movieGridQS.innerHTML += `
        <div class = "movie-card">
            <img src = ${base + movie.poster_path} class = movie-poster>
            <p class = movie-title>${movie.original_title}</p>
            <p class = movie-votes>${movie.vote_average}/10</p>
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

    //reset page number
    page = 1;
    loadCurrentlyPlaying(event)
}

//Finds currently playing movies when page loads
window.onload = loadCurrentlyPlaying
