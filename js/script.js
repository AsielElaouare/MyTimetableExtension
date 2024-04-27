const LAST_DAY_OF_WEEK = 4;
const baseUrl = "http://192.168.178.208:8383/";

const submitBtn = document.getElementById("submitBtn");
const input = document.getElementById("inputURL")

submitBtn.addEventListener('click', sendURL);


async function sendURL(e){
    e.preventDefault();
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify ({
            URL: input.value
        })
    });
    getData();
}


async function getData(){
    try
    {
        const res = await fetch(baseUrl, {
            method: "GET"
        });
        const data = await res.json();
        console.log("Data receveid:", data);
        localStorage.setItem("data", JSON.stringify(data));
        loadLessons(data);   
    }
    catch (error){
        console.error("Error fetchnig data:", error);
        const localData = JSON.parse(localStorage.getItem("data"));
        console.log("this is localdata: ",localData);
        loadLessons(localData);   
    };

};

function loadLessons(data){
    const currentWeekVar = currentWeek();
    data.forEach(lesson => {
        const { startDate, endDate, lastDay } = getLessonDays(lesson, currentWeekVar)
        lastDay.setDate(currentWeekVar.getDate() + LAST_DAY_OF_WEEK);
        if(startDate >= currentWeekVar && startDate <= lastDay)
        {
            displayLessons(lesson, startDate, endDate, currentWeekVar);
            
        }
    });

};

function getLessonDays(lesson, currentWeekVar){
    const startDateString = lesson["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, '');
    const endDateString = lesson["DTEND;TZID=Europe/Brussels"].replace(/\r/g, '');
    const isoStartDate = isoFormat(startDateString);
    const isoEndDate = isoFormat(endDateString);
    const startDate = new Date(isoStartDate);
    const endDate = new Date(isoEndDate);
    const lastDay = new Date(currentWeekVar);

    return { startDate, endDate, lastDay };
}

function currentWeek(){
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
    return startOfWeek;
};


function displayLessons(lesson, startDate, endDate, currentWeekVar){
    const div = document.createElement("div");
    const pTime = document.createElement("p");
    const pLocation = document.createElement("p");
    const pSummary = document.createElement("p");
    const startHour = startDate.getHours() + ":" + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes();
    const endHour = endDate.getHours() + ":" + (endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes();
    pTime.innerText = startHour + "-" + endHour;
    pLocation.innerText = lesson.LOCATION;
    pSummary.innerText = lesson.SUMMARY;
    
    div.appendChild(pTime);
    div.appendChild(pLocation);
    div.appendChild(pSummary);
    appendWeekDayHtmlTable(div, startDate);
    displayWeekHeader(currentWeekVar)

};

function displayWeekHeader(currentWeekVar){
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    const week = new Date(currentWeekVar); 
    let dayNumber = week.getDate();
    for(let i=  0; i <5; i++){
        let weekHtmlHeader = document.getElementById(daysOfWeek[i]);
        weekHtmlHeader.innerText = daysOfWeek[i] + " " + dayNumber;
        dayNumber++;
    }
}

function appendWeekDayHtmlTable(div, startDate){
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const dayOfWeek = (startDate.getDay() + 6) % 7; 
    const dayOfWeekString = daysOfWeek[dayOfWeek];

    let weekDayHtml = document.getElementById("lessons-" + dayOfWeekString);

    switch (dayOfWeekString) {
        case 'Monday':
            weekDayHtml.appendChild(div);
          break;
        case 'Tuesday':
            weekDayHtml.appendChild(div);
           break;
        case 'Wednesday':
            weekDayHtml.appendChild(div);
          break;
          case 'Thursday':
            weekDayHtml.appendChild(div);
          break;
          case 'Friday':
            weekDayHtml.appendChild(div);
          break;
        default:
      }
}
function isoFormat(date) {
    const dateString = date;
    const year = dateString.slice(0, 4);
    const month = dateString.slice(4, 6);
    const day = dateString.slice(6, 8);
    const hours = dateString.slice(9, 11);
    const minutes = dateString.slice(11, 13);
    const seconds = dateString.slice(13, 15);

    // Create a date object in Brussels time
    const brusselsDate = new Date(year, month - 1, day, hours, minutes, seconds);
    
    // Format the date as ISO string
    const isoDateString = brusselsDate.toISOString();

    return isoDateString;
};

getData();