import puppeteer from 'puppeteer';
import fs from 'fs';

//CUSTOM DATA

// TODO: Lien de la page de la recherche avec le lieu et le rayon --
const link = "https://labonnealternance.apprentissage.beta.gouv.fr/recherche-apprentissage?&display=list&job_name=D%C3%A9veloppement%20web%2C%20int%C3%A9gration&romes=M1805,M1806,M1802&radius=10&lat=48.859&lon=2.347&zipcode=75001&insee=75056&address=Paris&s=1697151929808";

// TODO: Les infos du candidat --
const infos = {
	lastName: "NOM",
	firstName: "Prénom",
	email: "email",
	phone: "tel",
	file: "./CV.pdf"
};

// Console log in file
const logStream = fs.createWriteStream('console.log', { flags: 'a' });
console.log = function (message) {
	const logMessage = `${message}\n`;
	process.stdout.write(logMessage);
	logStream.write(logMessage);
};

(async () => {
	function delay(time) {
		return new Promise(function (resolve) {
			setTimeout(resolve, time)
		});
	}
	// Launch the browser and open a new blank page
	const browser = await puppeteer.launch({
		headless: false
	});
	const page = await browser.newPage();
	let count = 0;
	// Navigate the page to a URL
	console.log('▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃');
	await page.goto(link);
	await delay(2000);
	const check = await page.waitForSelector('#__next > main > div > div.css-iiltjv > div > div.css-1161qt5 > div > div > div > div:nth-child(2) > span.chakra-checkbox__control.css-ildapo')
	await check.click();
	const elements = await page.$$('#jobList > a');
	console.log(`Il y a ${elements.length} entreprises.\n`);
	for (const element of elements) {
		await element.click();

		// Get company name
		const cpName = await page.waitForSelector('#itemDetailColumn > header > div > p > span.chakra-text.css-jr3ivs')
		const cpNameText = await cpName.evaluate(el => el.textContent);

		// TODO: Le message de la candidature avec le nom de l'entreprise --
		const message = `Bonjour, je souhaiterais candidater à l'entreprise ${cpNameText}...`
		console.log(`${cpNameText} : `);
		const button = await page.$('#itemDetailColumn > header > div > div.css-0 > div > div > button')
		if (button) {
			await button.click();
			// Handle form
			const lastNameInput = await page.waitForSelector('input[name="lastName"]');
			lastNameInput ? await lastNameInput.type(infos.lastName) : console.log("error in lastNameInput");
			const firstNameInput = await page.waitForSelector('input[name="firstName"]');
			firstNameInput ? await firstNameInput.type(infos.firstName) : console.log("error in firstNameInput");
			const emailInput = await page.waitForSelector('input[name="email"]');
			emailInput ? await emailInput.type(infos.email) : console.log("error in emailInput");
			const phoneInput = await page.waitForSelector('input[name="phone"]');
			phoneInput ? await phoneInput.type(infos.phone) : console.log("error in phoneInput");
			const messageInput = await page.waitForSelector('textarea[name="message"]');
			messageInput ? await messageInput.type(message) : console.log("error in messageInput");
			const [fileChooser] = await Promise.all([
				page.waitForFileChooser(),
				page.click('.css-1mz17vg')
			])
			fileChooser ? await fileChooser.accept([infos.file]) : console.log("error in fileChooser");
			const submitButton = await page.waitForSelector('button[aria-label="Envoyer la candidature spontanée"]');
			submitButton ? await submitButton.click() : console.log('error in submitButton');
			await delay(150);
			count++;
			console.log('candidature envoyée ✅');

		} else {
			console.log('pas de candidature spontanée');
		}
		console.log('――――――――――――――――――――――');
		await page.goBack();
	}
	await browser.close();
	console.log(`▃▃▃▃▃ ${count} candidatures envoyées ▃▃▃▃▃`);
})();
