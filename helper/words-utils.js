const wordScore = function (keywords, location){
    let score = 0;
    for(const keyword of keywords){
        score += 3*(location.name.toLowerCase().split(keyword.toLowerCase()).length -1);
        score += 2*(location.shortDesc.toLowerCase().split(keyword.toLowerCase()).length -1);
        score += (location.longDesc.toLowerCase().split(keyword.toLowerCase()).length -1);
    }
    return score;
}
module.exports ={wordScore}
