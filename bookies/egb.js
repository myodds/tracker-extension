const mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        for (const node of mutation.addedNodes) {
            if (node?.id === "bet-form" || node?.className === "match-details__item-full" || node?.className === "tabs") {
                addButtonOnDetail();
            }
        }
    });
});

mutationObserver.observe(document, {
    childList: true,
    subtree: true,
});

function addButtonOnDetail() {
    // Check if button exists
    const existingButton = document.getElementsByClassName("myodds-tracker-detail-btn");
    if (existingButton.length > 0) return;

    // Create new button
    const content = document.querySelector("#bet-form .tabs__content-item");
    if (!content) return;

    const button = document.createElement("BUTTON")
    const textNode = document.createTextNode("Save in tracker");

    button.addEventListener("click", function () {
        const match = getMatch();
        window.open("https://myodds.bet/tracker/dashboard/new-bet?" + getMatchUrlAttributes(match))
    });
    button.className = "btn btn--large match-details__place-bet myodds-tracker-detail-btn";
    button.appendChild(textNode);
    
    content.appendChild(button);
}

function getMatch() {
    const match = {};

    const matchDetails = document.getElementsByClassName("match-details")[0];
    
    setGameAndLeague(matchDetails, match);
    setTeams(matchDetails, match);
    setOdds(matchDetails, match);
    setBetType(matchDetails, match);
    setPick(matchDetails, match);
    setStake(match, matchDetails);

    match.bookmaker = "EGB";

    return match;
}

function setGameAndLeague(matchDetails, match) {
    const gameDiv = matchDetails.getElementsByClassName("match-details__game")[0];
    if (!gameDiv) return;

    const gameSpans = gameDiv.getElementsByTagName("span");
    match.game = gameSpans[0]?.innerText ?? "";
    match.event = gameSpans[1]?.innerText ?? "";
}

function setTeams(matchDetails, match) {
    const teams = matchDetails.getElementsByClassName("match-details__vs-player1-title");

    match.team1 = teams[0]?.innerText ?? "";
    match.team2 = teams[1]?.innerText ?? "";

    return teams;
}

function setOdds(matchDetails, match) {
    const activeOddsDiv = matchDetails.getElementsByClassName("bet-rate active")[0];

    match.odd = activeOddsDiv?.innerText ?? "";
}

function setBetType(matchDetails, match) {
    const typeDiv = matchDetails.querySelector(".js-match-active .match-details__row-title");
    if (typeDiv) {
        match.partOfGame = typeDiv.innerText === "" ? "Match" : "";
        match.typeOfBet = typeDiv.innerText === "" ? "Winner" : "";
    }
}

function setPick(matchDetails, match) {
    const activeOddsDiv = matchDetails.getElementsByClassName("bet-rate active")[0];
    const teamsDiv = matchDetails.getElementsByClassName("match-details__vs-player1-title");
    if (!activeOddsDiv || !teamsDiv) return;

    const allOddsDivs = activeOddsDiv.closest(".match-details__col-holder").getElementsByClassName("bet-rate");

    // Not sure if EGB has draws. For now if there are more than two odds skip pick.
    let oddsCount = 0;

    if (allOddsDivs && allOddsDivs.length < 3) {
        for (const oddsDiv of allOddsDivs) {
            if (oddsDiv === activeOddsDiv) {
                match.pick = teamsDiv[oddsCount]?.innerText ?? "";
            }

            oddsCount += 1;
        }
    }
}

function setStake(match, matchDetails) {
    match.stake = matchDetails.getElementsByClassName("field-number__input field-number__input--bet")[0]?.value ?? "";
    match.stake = match.stake === 0 ? "" : match.stake;
}

function getMatchUrlAttributes(match) {
    let attributes = "";

    for (const key of Object.keys(match)) {
        const value = match[key];
        attributes = attributes + key + "=" + value + "&"
    }

    return attributes;
}