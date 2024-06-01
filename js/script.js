const LAST_DAY_OF_WEEK = 5;
const baseUrl = "https://icalparser.asiel-elaouare.com";

const input = document.getElementById("inputURL");
const previousWeekBtnTag = document.getElementById("previousWeek");
const nextWeekBtnTag = document.getElementById("nextWeek");
const spinner = document.getElementById("spinner");
const schedule = document.getElementById("schedule");
const submitBtn = document.getElementById("submitBtn")

submitBtn.addEventListener('click', sendURL);

previousWeekBtnTag.addEventListener('click', previousWeekBtn);
nextWeekBtnTag.addEventListener('click', nextWeekBtn);

const currentWeekNow = currentWeek();

let currentDisplayedWeek = null;

async function sendURL() {
	let isValidURL = validatorURL(input.value);
	if (input.value != "" && isValidURL != false) {
		try {
			const res = await fetch(baseUrl, {
				method: 'POST',
				headers: {
					"Content-Type": 'application/json'
				},
				body: JSON.stringify({
					URL: input.value
				})
			});
			localStorage.setItem("icalURL", input.value);
			const data = await res.json();
			localStorage.setItem("data", JSON.stringify(data));
			getData(currentWeekNow);
		}
		catch {
			console.log("Server is Down")
		}
	};
};

function validatorURL(url) {
	try {
		new URL(url);
		return true;
	} catch (error) {
		return false;
	}
}

function showInputURL() {
	input.value = localStorage.getItem("icalURL")
}

async function getData(weekDate) {
	loadSpinner();
	const localData = JSON.parse(localStorage.getItem("data"));
	loadLessons(localData, weekDate);
};

function loadLessons(data, currentWeekVar) {
	deleteExistentData();
	data.forEach(lesson => {
		const { startDate, endDate, lastDay } = getLessonDays(lesson, currentWeekVar)
		lastDay.setDate(currentWeekVar.getDate() + LAST_DAY_OF_WEEK);
		if (startDate >= currentWeekVar && startDate <= lastDay) {
			displayLessons(lesson, startDate, endDate, currentWeekVar);
			displayWeekHeader(currentWeekVar);

			currentDisplayedWeek = currentWeekVar;

		}
		else {
			currentDisplayedWeek = currentWeekNow;
		}
	});
	displayWeekHeader(currentWeekVar);
	loadSchedule();
};

function nextWeek() {
	let currentWeekVar = currentDisplayedWeek;
	currentWeekVar.setDate(currentWeekVar.getDate() + 7);
	console.log("inside next function:", currentWeekVar);
	console.log(currentDisplayedWeek);
	return currentWeekVar;
};



function nextWeekBtn() {
	let week = nextWeek();
	getData(week);
};

function previousWeek() {
	let currentWeekVar = currentDisplayedWeek;
	currentWeekVar.setDate(currentWeekVar.getDate() - 7);
	console.log("inside previous function:", currentWeekVar);
	return currentWeekVar;
};

function previousWeekBtn() {
	let week = previousWeek();
	getData(week);
};

function getLessonDays(lesson, currentWeekVar) {
	const startDateString = lesson["DTSTART;TZID=Europe/Brussels"].replace(/\r/g, '');
	const endDateString = lesson["DTEND;TZID=Europe/Brussels"].replace(/\r/g, '');
	const isoStartDate = isoFormat(startDateString);
	const isoEndDate = isoFormat(endDateString);
	const startDate = new Date(isoStartDate);
	const endDate = new Date(isoEndDate);
	const lastDay = new Date(currentWeekVar);

	return { startDate, endDate, lastDay };
};

function currentWeek() {
	const today = new Date();
	const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 1);
	startOfWeek.setDate(startOfWeek.getDate());
	return startOfWeek;
};

function displayLessons(lesson, startDate, endDate, currentWeekVar) {
	const div = document.createElement("div");
	const pTime = document.createElement("p");
	const pLocation = document.createElement("p");
	const pSummary = document.createElement("p");
	const startHour = startDate.getHours() + ":" + (startDate.getMinutes() < 10 ? '0' : '') + startDate.getMinutes();
	const endHour = endDate.getHours() + ":" + (endDate.getMinutes() < 10 ? '0' : '') + endDate.getMinutes();

	pTime.classList.add("p-time")
	pLocation.classList.add("p-location")
	pSummary.classList.add("p-summary")
	div.classList.add("container-lessons")

	pTime.innerText = startHour + "-" + endHour;
	pLocation.innerText = lesson.LOCATION;
	pSummary.innerText = lesson.SUMMARY;

	div.appendChild(pTime);
	div.appendChild(pLocation);
	div.appendChild(pSummary);
	appendWeekDayHtmlTable(div, startDate);
};

function deleteExistentData() {
	const lessonCells = document.querySelectorAll('[id^="lessons-"]');
	lessonCells.forEach(cell => {
		cell.innerHTML = '';
	});
};

function displayWeekHeader(currentWeekVar) {
	let monthHeader = document.getElementById("month");
	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"];
	const week = new Date(currentWeekVar);
	const day = new Date(currentWeekVar);
	let dayNumber = week.getDate();
	for (let i = 0; i < 5; i++) {
		let weekHtmlHeader = document.getElementById(daysOfWeek[i]);
		weekHtmlHeader.innerText = daysOfWeek[i] + " " + dayNumber;
		day.setDate(day.getDate() + 1);
		dayNumber = day.getDate();
	};
	const month = week.toLocaleString('default', { month: 'long' });
	const weekNr = getWeekNumber(currentWeekVar);
	monthHeader.innerText = month + ", week " + weekNr;
};

function appendWeekDayHtmlTable(div, startDate) {
	const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
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
	};
};

function isoFormat(date) {
	const dateString = date;
	const year = dateString.slice(0, 4);
	const month = dateString.slice(4, 6);
	const day = dateString.slice(6, 8);
	const hours = dateString.slice(9, 11);
	const minutes = dateString.slice(11, 13);
	const seconds = dateString.slice(13, 15);

	const brusselsDate = new Date(year, month - 1, day, hours, minutes, seconds);
	const isoDateString = brusselsDate.toISOString();
	return isoDateString;
};

function getWeekNumber(date) {
	// Copy date so don't modify original
	date = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
	// Set to nearest Thursday: current date + 4 - current day number
	// Make Sunday's day number 7
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	// Get first day of year
	var yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	// Calculate full weeks to nearest Thursday
	var weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
	// Return array of year and week number
	return weekNo;
}

function loadSpinner() {
	spinner.style.visibility = "visible";
	schedule.style.visibility = "hidden";
};

function loadSchedule() {
	spinner.style.visibility = "hidden";
	schedule.style.visibility = "visible";
};
showInputURL();
sendURL();
getData(currentWeekNow);