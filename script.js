const searchAreaQS = document.querySelector("#search-area")
const searchInputQS = document.querySelector("#search-input")
const movieGridQS = document.querySelector("#movie-grid")
const moreButtonQS = document.querySelector("#load-more-movies-btn")
const searchTitleQS = document.querySelector("#search-title")
const nowPlayingQS = document.querySelector("#now-playing")
const exitSearchQS = document.querySelector("#exit-search")
const popUpQS = document.querySelector("#pop-up")
const closePopUpQS = document.querySelector("#close-pop-up")
const overlayQS = document.querySelector("#overlay")


const apiKey = "a19e39d99902fd05af15d47024f06075"
let page = 1
//base url for api
const apiBase = "https://api.themoviedb.org/3/"
//base url for images
const imageBase = "https://image.tmdb.org/t/p/original"
//Text from search box
let searchInput = ""
//varaible to hold video link
let videoLink = ""

//Checks if user searches for a movie
searchAreaQS.addEventListener("submit", handleFormSubmit)
//Exiting Search
exitSearchQS.addEventListener("click", exitSearch)
moreButtonQS.addEventListener("click", loadMore)



//Gets currently playing movies
async function loadCurrentlyPlaying(event) {
    event.preventDefault()
    let response = await fetch(apiBase + "movie/now_playing?api_key=" + apiKey + "&language=en-US&page=" + page)
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


    let response = await fetch(apiBase + "search/movie?api_key=" + apiKey + "&language=en-US&query=" + searchInput + "&page=" + page + "&include_adult=false")
    // console.log("response is: ")
    // console.log(response)

    let responseData = await response.json()
    // console.log("responseData is: ")
    // console.log(responseData)

    //If there are movies to display, display them
    if (responseData.results.length != 0) {
        displayResults(responseData.results)
    }
    //else, let the user know that there are no movies if it is the first page
    else if (page == 1) {
        movieGridQS.innerHTML = `
        <h2>No results for</h2>
        <h2>"${searchInput}"</h2>
        <h2>Please try another search term</h2>`
    }
    //Ran out of mvies to show
    else {
        movieGridQS.innerHTML += `
        <h2>No more results for</h2>
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
            <img src = ${imageBase + movie.poster_path} class = movie-poster alt = "${movie.original_title}" title = "${movie.original_title}" width = 100% height = auto>
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

//Returns a ID depending on if the rating for a movie is high, medium, or low
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

//Gets more information about a movie, and then calls displayPopup
async function getMoreInfo(card) {
    // console.log("Clicked")
    // console.log(card.id)

    //Reverse engineer the page num and index from the id of the card
    let index = (card.id) % 20
    let pageNum = (card.id - index) / 20 + 1
    // console.log("pageNum: " + pageNum)
    // console.log("index: " + index)

    //Fetch more data from the API
    //Searches for movie again, and then gets the id, then gets more info. Probably not the best method
    let response
    //If in search mode
    if (!(searchTitleQS.classList.contains("hidden"))) {
        response = await fetch(apiBase + "search/movie?api_key=" + apiKey + "&language=en-US&query=" + searchInput + "&page=" + pageNum + "&include_adult=false")
    }
    //If in currently playing mode
    else {
        response = await fetch(apiBase + "movie/now_playing?api_key=" + apiKey + "&language=en-US&page=" + pageNum)
    }

    responseData = await response.json()

    let info = await fetch(apiBase + "movie/" + responseData.results[index].id + "?api_key=" + apiKey)
    let infoData = await info.json()

    // console.log("infoData is: ")
    // console.log(infoData)

    displayPopUp(infoData)
    // console.log(responseData)
}

//Displayes popup with more information on a movie
async function displayPopUp(movieInfo) {

    // console.log("movieInfo is: ")
    // console.log(movieInfo)
    popUpQS.classList.remove("hidden")
    overlayQS.classList.remove("hidden")
    await getTrailer(movieInfo)
    console.log(videoLink)
    popUpQS.innerHTML = `
    <button type="submit" id="close-pop-up" onclick= "closePopUp()">x</button>
    <h2 class= "pop-up-item">${movieInfo.title}</h2>
    <h3 class= "pop-up-item">Runtime: ${convertRuntime(movieInfo.runtime)}</h3>
    <h3 class= "pop-up-item">Release date: ${movieInfo.release_date}</h3>
    <h3 class= "movie-votes ${voteIdSelect(movieInfo.vote_average)} pop-up-item">Rating: ${movieInfo.vote_average}/10</h3>
    <p class= "pop-up-item">Synopsis: ${movieInfo.overview}</p>
    <div id = "trailer-holder">
        <iframe id= "pop-up-video" width="480" height="270" src= ${videoLink}></iframe>
    </div>

    `

}
//Closes popup
function closePopUp() {
    // console.log("Hello")
    popUpQS.classList.add("hidden")
    overlayQS.classList.add("hidden")
    popUpQS.innerHTML = `<button type="submit" id="close-pop-up" onclick= "closePopUp()">x</button>`
}

//Returns trailer URL
async function getTrailer(movie)
{
    response = await fetch(apiBase + "movie/" + movie.id + "/videos?api_key=" + apiKey);
    // console.log("response is: ")
    // console.log(response)

    responseData = await response.json()
    // console.log("responseData is: ")
    // console.log(responseData)

    official = responseData.results.filter((trailer) => { return trailer.name.indexOf("Official Trailer") !== -1})
    // responseData.results.forEach((trailer) => console.log(trailer.name))
    // console.log("official is: ")
    // console.log(official)

    // console.log("https://www.youtube.com/watch?v=" + official[0].key)

    //If I can find a trailer that has "Official Trailer" in its name
    if(official.length >= 1)
    {
        videoLink =  "https://www.youtube.com/embed/" + official[0].key
    }
    //else, just return the first one, if there is a trailer
    else if(responseData.results.length > 0)
    {
        videoLink = "https://www.youtube.com/embed/" + responseData.results[0].key
    }
    else{
        videoLink = ''
    }


}
function convertRuntime(runtime)
{
    let minutes = runtime % 60
    let hours = (runtime-minutes) / 60

    convertedRuntime =""
    if(hours > 0)
    {
        if(hours == 1)
        {
            convertedRuntime += hours + " hour "
        }
        else
        {
            convertedRuntime += hours + " hours "
        }
    }
    if(minutes > 0)
    {
        if(minutes == 1)
        {
            convertedRuntime += minutes + " minute"
        }
        else
        {
            convertedRuntime += minutes + " minutes"
        }
    }
    return convertedRuntime
}

//Adds event listeners to cards
function addEventListenerToCards() {
    const movieCardQS = document.querySelectorAll(".movie-card")
    // console.log(movieCardQS.length)
    movieCardQS.forEach(card => {
        card.addEventListener("click", () => getMoreInfo(card))
        // console.log("Added")
    })
}

//Finds currently playing movies when page loads
window.onload = loadCurrentlyPlaying
