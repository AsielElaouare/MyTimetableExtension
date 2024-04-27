function loadLessons(data) {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    // Get the start date of the current week (Monday)
    const today = new Date();
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);

    // Populate the header with dates for each day of the current week
    daysOfWeek.forEach((day, index) => {
        const dayHtmlTag = document.getElementById(day);
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(currentDate.getDate() + index);
        dayHtmlTag.innerText =  day + " " + currentDate.getDate();
    });

    // Filter the lessons data to show only lessons within the current week
    const lessonsThisWeek = data.filter(element => {
        const dateString = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDate = isoFormat(dateString);
        const startDate = new Date(isoDate);
        return startDate >= startOfWeek && startDate <= new Date(); // Filter lessons for the current week
    });

    // Populate the calendar with lessons for the current week
    lessonsThisWeek.forEach(element => {
        const dateStringStart = element["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const dateStringEnd = element["DTEND;TZID=Europe/Brussels"].replace(/\r/g, ''); // Remove trailing newline
        const isoDateStart = isoFormat(dateStringStart);
        const isoDateEnd = isoFormat(dateStringEnd);
        const startDate = new Date(isoDateStart);
        const endDate = new Date(isoDateEnd);

        const dayOfWeek = (startDate.getDay() + 6) % 7; // Adjust for Monday being the first day
        const dayOfWeekString = daysOfWeek[dayOfWeek];

        const lessonsElement = document.getElementById("lessons-" + dayOfWeekString);

        const cell = document.createElement("div"); // Using a div for vertical display   

        const {pTime, pLocation, pSummary} = displayData(startDate, endDate, element, cell);

        cell.appendChild(pTime);
        cell.appendChild(pSummary);
        cell.appendChild(pLocation);

        if (lessonsElement) {
            lessonsElement.appendChild(cell);
        } else {
            console.error("Lessons element not found for day:", dayOfWeekString);
        }
    });
}