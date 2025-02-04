var searchPosition = "middle";
var searchTimer = -1;
var SEARCH_DELAY = 300;

function performSearch() {
    $.get(
        "https://www.googleapis.com/youtube/v3/search", {
            part: "snippet",
            type: "video",
            maxResults: 6,
            key: "AIzaSyB7iHSP00xDSsam97vYtsPuMXyH15_TRSY",
            q: $("#search_query").val()
        },
        function(data) {
            unbindSearchResults();
            $('.search_results').empty();
            console.log(data.items);
            var results = data.items;
            for (var i = 0; i < results.length; i++) {
                $(".search_results").append(
                    "<div class=\"result\" data-id=\"" + results[i].id.videoId +
                    "\" data-title=\"" + results[i].snippet.title +
                    "\" data-channel_name=\"" + results[i].snippet.channelTitle +
                    "\" data-description=\"" + results[i].snippet.description +
                    "\" data-thumbnail=\"" + results[i].snippet.thumbnails.default.url +
                    "\"><img src=\"" + results[i].snippet.thumbnails.default.url +
                    "\"><div class=\"info\"><h2>" + results[i].snippet.title + "</h2>" +
                    "<h4>" + results[i].snippet.channelTitle + "</h4></div></div>"
                );
            }
            bindSearchResults();
        })
}

function bindSearchResults() {
    $(".search_results > div").on("click", function() {
        $(".loading").show();
        toggleOverlay();
        var query = {
            id: $(this).data("id"),
            title: $(this).data("title"),
            description: $(this).data("description"),
            channel_name: $(this).data("channel_name"),
            thumbnail: $(this).data("thumbnail")
        }
        $.get(
            "/api/download",
            query,
            function(response) {
                console.log(response);
                startSong("assets/3D/audio/downloaded/" + response.file + ".mp3");
                $(".loading").hide();
            }
        )
    });
}

function unbindSearchResults() {
    $('.search_results > div').unbind("click");
}

$("#search_query").on("keyup", function(event) {
    if (searchTimer != -1) {
        clearInterval(searchTimer);
    }

    searchTimer = setInterval(function() {
        clearInterval(searchTimer);
        searchTimer = -1;

        if ($("#search_query").val()) {
            performSearch();
        }
    }, SEARCH_DELAY);

    // move search bar to top
    if ($("#search_query").val() != "" && searchPosition == "middle") {
        $(".search_title").fadeOut(400);
        $("#search_query").animate({
            top: "0%"
        }, 500, function() {
            // callback
            $("#search_query").css("position", "relative");
        });
        
        searchPosition = "top";
    // Move search bar to middle
    } else if ($("#search_query").val() == "" && searchPosition == "top") {
        $(".search_title").fadeIn(400);
        $('.search_results').empty();
        $("#search_query").css("position", "absolute");
        $("#search_query").animate({
            top: "40%"
        }, 500, function() {
            // callback   
        });
        searchPosition = "middle";
    }
})

// Bind panel switcher between search and recent
$(".toggle_panel").click(function() {
    if ($(".search_panel").hasClass("active")) {
        $(".search_panel").removeClass("active");
        $(".recent_panel").addClass("active");
        $(this).find("h1").html("Search for a song <i class=\"fa fa-search fa-lg\"></i>");
        loadRecentlyPlayed();
    } else {
        $(".search_panel").addClass("active");
        $(".recent_panel").removeClass("active");
        $(this).find("h1").html("Check out recently played songs <i class=\"fa fa-arrow-right fa-lg\"></i>");
        $(".recent").empty();
        $("#search_query").focus();
        unbindRecentlyPlayed()
    }
})

// Bind sort most recent click -- loads most played and swaps DOM
$(".sort_recent").click(function() {
    $(".recent").empty();
    $(this).removeClass("active");
    $(".sort_most").addClass("active");
    loadRecentlyPlayed("played");
})

// Bind sort most played click -- loads most recent and swaps DOM
$(".sort_most").click(function() {
    $(".recent").empty();
    $(this).removeClass("active");
    $(".sort_recent").addClass("active");
    loadRecentlyPlayed("recent");
})

// Takes in boolean for recent. if true, return in recent order, else return in most played order
function loadRecentlyPlayed(sortOrder) {
    $.get("api/getRecent", {sortOrder: sortOrder},
                function(response) {
            for (var i = 0; i < response.length; i++) {
                $(".recent").append(
                    "<div class=\"result\" data-file=\"" + response[i].file +
                    "\" data-id=\"" + response[i].id +
                    "\"><img src=\"" + response[i].thumbnail +
                    "\"><div class=\"info\"><h2>" + response[i].title + "</h2>" +
                    "<h4>" + response[i].channel + "</h4>" + 
                    "</div><div id=\"playCount\">Played: " + response[i].playCount + "</div></div>"
                )
            }
            bindRecentlyPlayed();
        });
}

function bindRecentlyPlayed() {
    $(".recent > div").on("click", function() {
        $.get("api/playRecent", {id: $(this).data("id")}, function(response) {
            startSong("assets/3D/audio/downloaded/" + response.file + ".mp3");
        })
        // startSong("assets/3D/audio/downloaded/" + $(this).data("file") + ".mp3");
        toggleOverlay();
    })
}

function unbindRecentlyPlayed() {
    $(".recent > div").unbind("click")
}
