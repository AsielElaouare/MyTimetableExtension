const baseUrl = 'http://192.168.178.208:8383/';

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

    // Get the end date of the current week (Friday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 4);

    // Filter the lessons data to show only lessons within the current week
    const lessonsThisWeek = data.filter(element => {
        const dateString = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDate = isoFormat(dateString);
        const startDate = new Date(isoDate);
        return startDate >= startOfWeek && startDate <= endOfWeek;
    });

    // Populate the calendar with lessons for the current week
    lessonsThisWeek.forEach(element => {
        const dateString = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDate = isoFormat(dateString);
        const startDate = new Date(isoDate);

        const dayOfWeek = (startDate.getDay() + 6) % 7; // Adjust for Monday being the first day
        const dayOfWeekString = daysOfWeek[dayOfWeek];

        const lessonsElement = document.getElementById("lessons-" + dayOfWeekString);
        const dayHtmlTag = document.getElementById(dayOfWeekString);
        dayHtmlTag.innerText =  dayOfWeekString + " " + startDate.getDate();

        const cell = document.createElement("div"); // Using a div for vertical display
        cell.innerText = element.SUMMARY; // Display the date and summary

        if (lessonsElement) {
            lessonsElement.appendChild(cell);
        } else {
            console.error("Lessons element not found for day:", dayOfWeekString);
        }
    });
}

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
