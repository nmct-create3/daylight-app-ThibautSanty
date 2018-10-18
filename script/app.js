// _ = helper functions
let _calculateTimeDistance = (startTime, endTime) => {
	// Bereken hoeveel tijd er tussen deze twee periodes is.
	// Tip: werk met minuten.
	let start = new Date('0001-01-01 ' + startTime);
	let end = new Date('0001-01-01 ' + endTime);
	let diffMs = (end.getTime() - start.getTime())/60000;
	console.log(diffMs);
	return diffMs;
}

// Deze functie kan een am/pm tijd omzetten naar een 24u tijdsnotatie, deze krijg je dus al. Alsjeblieft, veel plezier ermee.
let _convertTime = (t) => {
	/* Convert 12 ( am / pm ) naar 24HR */
	let time = new Date('0001-01-01 ' + t);
	let formatted = time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2);
	return formatted;
}

// 5 TODO: maak updateSun functie
function updateSun(totalmin,minutes_sun_is_up,procent){
	let sun = document.getElementById("js-sun");
	sun.style.left = procent+"%";
	let current_time = new Date();
	// test
	//let current_time = new Date('0001-01-01 ' + "13:20");
	sun.setAttribute("data-time", current_time.getHours()+":"+current_time.getMinutes() );
	
	let midDay = totalmin / 2;
	
	if(minutes_sun_is_up >= midDay){
		let bottom = 100 - ((minutes_sun_is_up - midDay)/midDay)*100;
		sun.style.bottom = bottom+"%";
	}
	else{
		let bottom = (minutes_sun_is_up/midDay)*100;
		sun.style.bottom = bottom+"%";
	}

	if(procent >= 100){
		console.log("current procent = "+ procent);
		document.getElementById("html").classList.add("is-night");
		document.getElementById("js-time-left").innerHTML = "time is "+ current_time.getHours()+":"+current_time.getMinutes() +" null";
	}
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = ( totalMinutes, sunrise, sunset ) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	let sun = document.getElementById("js-sun");
	let current_time = new Date();
	// test time
	//let current_time = new Date('0001-01-01 ' + "13:20");
	let sunset_time = new Date('0001-01-01 ' + sunset);
	let sunrise_time = new Date('0001-01-01 ' + sunrise);


	let minutes_to_sun_down = (sunset_time.getHours()*60 + sunset_time.getMinutes()) - (current_time.getHours()*60+current_time.getMinutes())
	console.log("current time in minutes = "+current_time.getHours()*60+current_time.getMinutes()+ "\ntime sun goes down = "+ sunset_time.getHours()*60 + sunset_time.getMinutes() + "\nminutes left " +minutes_to_sun_down);

	let minutes_sun_is_up = (current_time.getHours()*60+current_time.getMinutes()) - (sunrise_time.getHours()*60 + sunrise_time.getMinutes())
	console.log("time sun did rise = "+ sunrise_time.getHours()*60 + sunrise_time.getMinutes() + "\nminutes sun is up " +minutes_sun_is_up);

	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	let procent_sun_is_up = ((totalMinutes - minutes_to_sun_down)/totalMinutes)*100;
	document.getElementById("body").classList.add("is-loaded");
	document.getElementById("js-time-left").innerHTML = minutes_to_sun_down;
	console.log("sun is "+ Math.round(procent_sun_is_up)+" % far of his day");
	updateSun(totalMinutes,minutes_sun_is_up,procent_sun_is_up);

	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	
	setInterval(updateSun(totalMinutes,minutes_sun_is_up,procent_sun_is_up), 6000);
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
}

// 3 Met de data van de API kunnen we de app opvullen
let showResult = ( queryResponse ) => {
	console.log(queryResponse);
	let json_obj = JSON.parse(JSON.stringify(queryResponse));
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	let sunrise = document.getElementById("js-sunrise");
	let sunset = document.getElementById("js-sunset");
	let location = document.getElementById("js-location");
	let sunrise_C = _convertTime(json_obj.query.results.channel.astronomy.sunrise);
	let sunset_C = _convertTime(json_obj.query.results.channel.astronomy.sunset);
	sunrise.innerHTML = sunrise_C;
	sunset.innerHTML = sunset_C;
	location.innerHTML = json_obj.query.results.channel.location.city +", "+ json_obj.query.results.channel.location.country

	// Hier gaan we een functie oproepen die de zon een bepaalde postie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	let periode_in_minutes = _calculateTimeDistance(sunrise_C , sunset_C);
	placeSunAndStartMoving(periode_in_minutes,sunrise_C,sunset_C);
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = ( lat, lon ) => {
	console.log("getting API");
	// Eerst bouwen we onze url op
	let url = "https://query.yahooapis.com/v1/public/yql?q=";
	// en doen we een query met de Yahoo query language
	let query = "select%20astronomy%2Clocation%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22("+ lat.toString() +"%2C%20"+ lon.toString() +")%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys";
	let location_url = url + query;
	console.log(location_url);

	// Met de fetch API proberen we de data op te halen.
	fetch(location_url).then(res => res.json()).then(response => showResult(response)).catch(error => console.error("error: ", error));
	// Als dat gelukt is, gaan we naar onze showResult functie.
}

document.addEventListener( 'DOMContentLoaded', function () {
	// 1 We will query the API with longitude and latitude.
	getAPI( 50.8027841, 3.2097454 );
});

