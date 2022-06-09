const searchAreaQS = document.querySelector("#search-area")
const searchInputQS = document.querySelector("#search-input")
const movieGridQS = document.querySelector("#movie-grid")
const moreButtonQS = document.querySelector("#load-more-movies-btn")

const apiKey = "a19e39d99902fd05af15d47024f06075"
page = 1
const base = "https://image.tmdb.org/t/p/w500"

//Gets currently playing movies
async function loadCurrentlyPlaying(event)
{
    event.preventDefault()
    let response = await fetch("https://api.themoviedb.org/3/movie/now_playing?api_key="+apiKey+"&language=en-US&page="+page)
    console.log("response is: ")
    console.log(response)

    let responseData = await response.json()
    console.log("responseData is: ")
    console.log(responseData)

    displayResults(responseData.results)
}

//Display results from an array
function displayResults(results)
{
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


//Finds currently playing movies when page loads
window.onload = loadCurrentlyPlaying
