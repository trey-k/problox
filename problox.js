function displayResults( result ) {
	$(result).each(function ( index ) {
		game = $(this)[0];
		tile = $("<div class=\"game\"><a><img class=\"gamethumb\"><div class=\"gametitle\"></div><div class=\"gamedetails\"></div><div class=\"gamedetails extended\"></div></a></div>").appendTo('.results');
		game.RatioPreFormat = Math.trunc((game.TotalUpVotes/(game.TotalUpVotes + game.TotalDownVotes))*100);
		game.Ratio = game.RatioPreFormat || "--";
		if (game.Ratio !== "--") {
			game.Ratio = game.Ratio + "%";
		}
		$(tile).attr({
			"data-default": index,
			"data-players": game.PlayerCount,
			"data-plays": game.Plays,
			"data-price": game.Price,
			"data-down": game.TotalDownVotes,
			"data-up": game.TotalUpVotes,
			"data-ratio": game.RatioPreFormat || "0"
		}).find('a').attr({
			"href": game.GameDetailReferralUrl
		}).find('.gamethumb').attr({
			"src": game.Url
		}).next('.gametitle').text(
			game.Name
		).attr({
			"title": game.Name + " by " + game.CreatorName
		}).next('.gamedetails').html(
			"<span class=\"votes icon\"></span><span class=\"detailtext\">" + game.Ratio + "</span><span class=\"players icon\"></span><span class=\"players detailtext\">" + formatNumber(game.PlayerCount) + "</span><span class=\"plays icon\"></span><span class=\"plays detailtext\">" + formatNumber(game.Plays) + "</span>"
		).next('.gamedetails').html(
			"<span class=\"upvotes icon\"></span><span class=\"detailtext\">" + formatNumber(game.TotalUpVotes) + "</span><span class=\"downvotes icon\"></span><span class=\"detailtext\">" + formatNumber(game.TotalDownVotes) + "</span>"
		);
	});
	sortGames($('#searchsort').val(), $('#searchorder').val());
}

function doSearch( query ) {
	$('#loading').show();
	$.ajax({
        url: 'https://cors-anywhere.herokuapp.com/https://www.roblox.com/games/list-json',
        type: 'get',
        dataType: 'json',
        data: query,
        success: function( result ) {
        		   $('#loading').hide();
                   displayResults(result);
                   $('#backbutton').val("1");
                   sessionStorage.clear();
                   sessionStorage.setItem($('#searchbox').val(), JSON.stringify(result));
                 }
    });
}

function sortGames( selector, order ) {
	$('.game').sort(function (a, b) {	
		if (order === "asce" || selector === "default") {
			return ($(b).data(selector)) < ($(a).data(selector)) ? 1 : -1;
		} else {
			return ($(b).data(selector)) > ($(a).data(selector)) ? 1 : -1;    
		}
	}).appendTo('.results');
}

var ranges = [
  { divider: 1e9 , suffix: 'B' },
  { divider: 1e6 , suffix: 'M' },
  { divider: 1e3 , suffix: 'k' }
];

function formatNumber(n) {
  for (var i = 0; i < ranges.length; i++) {
    if (n >= ranges[i].divider) {
      return ((n / ranges[i].divider).toFixed(1)).replace(".0", "") + ranges[i].suffix;
    }
  }
  return n.toString();
}

$(document).ready(function() {	
	var searchQuery = {};
	location.search.substr(1).split("&").forEach(function(item) {searchQuery[item.split("=")[0]] = item.split("=")[1]});
	decodeQuery = decodeURI(searchQuery["Keyword"]);
	if (searchQuery["Keyword"]) {
		if ($('#backbutton').val()) {
			cacheResult = JSON.parse(sessionStorage.getItem(decodeQuery));
			displayResults(cacheResult);
		} else {
			$('#searchbox').val(decodeQuery);
			if (searchQuery["OrderBy"]) {
				$('#searchorder').val(searchQuery["OrderBy"]);
			} else {
				$('#searchorder').val("desc");
			}
			if (searchQuery["SortBy"]) {
				$('#searchsort').val(searchQuery["SortBy"]);
			} else {
				$('#searchsort').val("default");
			}
			doSearch(window.location.search.substring(1));
		}
	}
	$('form').submit( function( e ) {
		cereal = $('form').serialize();
		$('.results').empty();
		history.replaceState(null, null, "?" + cereal);
		e.preventDefault();
	    doSearch(cereal);
	});
	$('#searchsort, #searchorder').change( function() {
		if ($('#searchsort').val() === "default") {
			$('#searchorder').prop("disabled", true);
		} else {
			$('#searchorder').prop("disabled", false);
		}
		sortGames($('#searchsort').val(), $('#searchorder').val());
	});
});