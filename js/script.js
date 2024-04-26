const baseUrl = 'http://localhost:8383/'; // windows machine

const input = document.getElementById("inputLink");
const submitBtn = document.getElementById("submitBtn");

submitBtn.addEventListener('click', sendURL)

async function sendURL(e){
    e.preventDefault()
    const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify ({
            URL : input.value
        })
    });
}


async function getResponse() {
    try {
        const res = await fetch(baseUrl, {
            method: 'GET'
        });
        const data = await res.json();
        console.log("Data received:", data); // Check if data is received properly
        loadLessons(data);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}
function loadLessons(data) {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Get the start date of the current week (Monday)
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);

    // Generate dates for each day of the current week
    const datesThisWeek = [];
    for (let i = 0; i < 5; i++) { // 5 days from Monday to Friday
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(currentDate.getDate() + i);
        datesThisWeek.push(currentDate);
    }

    // Populate the header with dates for each day of the current week
    daysOfWeek.forEach((day, index) => {
        const dayHtmlTag = document.getElementById(day);
        const currentDate = datesThisWeek[index];
        dayHtmlTag.innerText =  day + " " + currentDate.getDate();
    });

    // Filter the lessons data to show only lessons within the current week
    const lessonsThisWeek = data.filter(element => {
        const dateString = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDate = isoFormat(dateString);
        const startDate = new Date(isoDate);
        return startDate >= startOfWeek && startDate <= datesThisWeek[4]; // Filter lessons for the current week
    });

    // Populate the calendar with lessons for the current week
    lessonsThisWeek.forEach(element => {
        const dateStringStart = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const dateStringEnd = element["DTEND;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDateStart = isoFormat(dateStringStart);
        const isoDateEnd = isoFormat(dateStringEnd);
        const startDate = new Date(isoDateStart);
        const endDate = new Date(isoDateEnd)

        const dayOfWeek = (startDate.getDay() + 6) % 7; // Adjust for Monday being the first day
        const dayOfWeekString = daysOfWeek[dayOfWeek];

        const lessonsElement = document.getElementById("lessons-" + dayOfWeekString);

        const cell = document.createElement("div"); // Using a div for vertical display

        const {pTime, pLocation, pSummary} = displayData(startDate, endDate,  element);

        cell.appendChild(pTime)
        cell.appendChild(pSummary)
        cell.appendChild(pLocation)


        if (lessonsElement) {
            lessonsElement.appendChild(cell);
        } else {
            console.error("Lessons element not found for day:", dayOfWeekString);
        }
    });
}


function displayData(startDate, endDate, element){
    const pTime = document.createElement("p"); 
    const pSummary = document.createElement("p"); 
    const pLocation = document.createElement("p"); 

    pTime.innerText = startDate.getHours() + ":" + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes() + "-" + endDate.getHours() +":" +(endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes();
    pSummary.innerText = element.SUMMARY;
    pLocation.innerText = element.LOCATION;

    pTime.style.fontSize = "small"
    pLocation.style.fontSize = "small"
    pSummary.style.fontSize = "small"
    return { pTime, pSummary, pLocation};
};



function isoFormat(date){
        const dateString = date;
        const year = dateString.slice(0, 4);
        const month = dateString.slice(4, 6);
        const day = dateString.slice(6, 8);
        const hours = dateString.slice(9, 11);
        const minutes = dateString.slice(11, 13);
        const seconds = dateString.slice(13, 15);
        const isoDateString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}Z`;
        return isoDateString; 
}


getResponse();
