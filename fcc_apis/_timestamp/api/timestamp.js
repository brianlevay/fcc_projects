/* This is the main controlling function that returns the timestamp values */

function timeStamp(input) {
    var unix = '';
    var natural = '';
    
    var divided = divideQuery(input);
    var words = divided.words;
    var nums = divided.nums;
    
    if (words.length === 1 && nums.length >= 1 && nums.length <= 2) {
        // Handle date as possibly valid string //
        var dateVals = convertNatural(divided);
        if (dateVals.year != -1 && dateVals.month != -1 && dateVals.day != -1) {
            unix = naturalToUnix(dateVals);
            natural = dateVals.monthStr + " " + dateVals.day + ", " + dateVals.year;
        }
    } else if (words.length === 0 && nums.length === 1) {
        // Handle data as UNIX timestamp //
        unix = input;
        natural = unixToNatural(input);
    }
    
    return {"unix": unix, "natural": natural};
}

/* This splits the input string into words and numbers */

function divideQuery(input) {
    var string = input + ".";
    var words = [];
    var nums = [];
    var word = "";
    var num = "";
    var wordStart = 0;
    var numStart = 0;
    for (var i = 0; i < string.length-1; i++) {
        /* Divide into words and numbers based on differences in 
        type between i and i+1 */
        var charI0 = charType(string[i]);
        var charI1 = charType(string[i+1]);
        if (charI0.letter && charI1.other) {
            word = input.substr(wordStart,i-wordStart+1);
            words.push(word);
        } else if (charI0.letter && charI1.number) {
            word = input.substr(wordStart,i-wordStart+1);
            words.push(word);
            numStart = i+1;
        } else if (charI0.number && charI1.other) {
            num = input.substr(numStart,i-numStart+1);
            nums.push(num);
        } else if (charI0.number && charI1.letter) {
            num = input.substr(numStart,i-numStart+1);
            nums.push(num);
            wordStart = i+1;
        } else if (charI0.other && charI1.letter) {
            wordStart = i+1;
        } else if (charI0.other && charI1.number) {
            numStart = i+1;
        }
    }
    return {words: words, nums: nums};
}

function charType(char) {
    var letter = false;
    var number = false;
    var other = true;
    if (char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90) {
        letter = true;
        other = false;
    } else if (char.charCodeAt(0) >= 97 && char.charCodeAt(0) <= 122) {
        letter = true;
        other = false;
    } else if (char.charCodeAt(0) >= 48 && char.charCodeAt(0) <= 57) {
        number = true;
        other = false;
    }
    return {letter: letter, number: number, other: other};
}

/* This function takes the word and number arrays and tries to assign those to date components */

function convertNatural(divided) {
    var monthsLong = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var monthsShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    var daysInMonth = [31,29,31,30,31,30,31,31,30,31,30,31];
    var year = -1;
    var month = -1;
    var day = -1;
    var monthStr = "";
    var queryWord = divided.words[0].toLowerCase();
    for (var i = 0; i < 12; i++) {
        if (queryWord == monthsLong[i].toLowerCase()) {
            month = i; 
            monthStr = monthsLong[i];
        }
        if (queryWord == monthsShort[i].toLowerCase()) {
            month = i; 
            monthStr = monthsLong[i];
        }
    }
    if (month != -1) {
        if (divided.nums.length === 1) {
            year = parseInt(divided.nums[0]);
            day = 1;
        } else {
            year = parseInt(Math.max(divided.nums[0],divided.nums[1]));
            day = parseInt(Math.min(divided.nums[0],divided.nums[1]));
            if (day > daysInMonth[month]) {day = -1;}
        }
    }
    return {year: year, month: month, day: day, monthStr: monthStr};
}

/* This takes a pre-determined date format and converts it to Unix time */

function naturalToUnix(dateVals) {
    var date = new Date(dateVals.year,dateVals.month,dateVals.day);
    var unix = Math.floor(date.getTime()/1000);
    return unix;
}

/* This takes any integer value and converts it to a natural date */

function unixToNatural(input) {
    var date = new Date(parseInt(input)*1000);
    var year = date.getFullYear();
    var monthNum = date.getMonth();
    var day = date.getDate();
    var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    var monthStr = months[monthNum];
    var natural = monthStr + " " + day + ", " + year;
    return natural;
}

/* This makes the function available */

module.exports = {
    timeStamp: timeStamp
};
