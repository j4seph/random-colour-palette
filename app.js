//---ONCE FINISHED UPDATE THE CODE IN SUBLIME TEXT TO GET RID OF THE UGLY CODE IN THE SLIDER BACKGROUNDS

//using the chroma js cdn to build out the code here
//as I'm English, all the variable's that I'm defining use the spelling colour and all those that js/html define are color (could be a little confusing)

// GLOBAL SELECTIONS
const colourDivs = document.querySelectorAll('.colour');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.colour h2');
const popup = document.querySelector('.copy-container');
const adjustButton = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const lockButton = document.querySelectorAll('.lock');
let initialColours;

//local storage for the library
let savedPalettes = [];

// EVENT LISTENERS

generateButton.addEventListener('click', randomColours);

sliders.forEach(slider => {
	slider.addEventListener('input', hslControls);
});

colourDivs.forEach((div, index) => {
	div.addEventListener('change', () => {
		updateTextUI(index);
	});
});

currentHexes.forEach(hex => {
	hex.addEventListener('click', () => {
		copyToClipboard(hex);
	});
});

popup.addEventListener('transitionend', () => {
	const popupBox = popup.children[0];
	popup.classList.remove('active');
	popupBox.classList.remove('active');
});

adjustButton.forEach((button, index) => {
	button.addEventListener('click', () => {
		openAdjustmentPanel(index);
	});
});

closeAdjustments.forEach((button, index) => {
	button.addEventListener('click', () => {
		closeAdjustmentPanel(index);
	});
});

lockButton.forEach((button, index) => {
	button.addEventListener('click', e => {
		lockLayer(e, index);
	});
});

// FUNCTIONS

//random colour generator
function generateHex() {
	const hexColour = chroma.random();
	return hexColour;
}

//putting the random colour onto the colour divs as the background colour and replacing the hex value

function randomColours() {
	initialColours = [];

	colourDivs.forEach((div, index) => {
		const hexText = div.children[0];
		const randomColour = generateHex();

		if (div.classList.contains('locked')) {
			initialColours.push(hexText.innerText);
			return;
		} else {
			initialColours.push(chroma(randomColour).hex());
		}

		//add colour to the background
		div.style.backgroundColor = randomColour;
		hexText.innerText = randomColour;

		//check the contrast so we can put the hex as black or white
		checkContrast(randomColour, hexText);

		//initialise colour sliders
		const colour = chroma(randomColour);
		const sliders = div.querySelectorAll('.sliders input');
		const hue = sliders[0];
		const brightness = sliders[1];
		const saturation = sliders[2];

		sliderBackgrounds(colour, hue, brightness, saturation);
	});

	resetInputs();

	// check the contrast on the lock and adjustment icons/buttons
	adjustButton.forEach((button, index) => {
		checkContrast(initialColours[index], button);
		checkContrast(initialColours[index], lockButton[index]);
	});
}

function checkContrast(colour, text) {
	const luminance = chroma(colour).luminance();
	if (luminance > 0.5) {
		text.style.color = 'black';
	} else {
		text.style.color = 'white';
	}
}

function sliderBackgrounds(colour, hue, brightness, saturation) {
	//saturation slider
	const noSaturation = colour.set('hsl.s', 0);
	const fullSaturation = colour.set('hsl.s', 1);
	const scaleSaturation = chroma.scale([noSaturation, colour, fullSaturation]);

	//brightness slider
	const midBrightness = colour.set('hsl.l', 0.5);
	const scaleBrightness = chroma.scale(['black', midBrightness, 'white']);

	//update input colours
	saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(
		0
	)}, ${scaleSaturation(1)})`;

	brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
		0
	)}, ${midBrightness},
    ${scaleBrightness(1)})`;

	hue.style.backgroundImage = `linear-gradient(to right, rgb(204, 75, 75), rgb(204,204,75), rgb(75,204,75), rgb(75, 204, 204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204,75,75))`;
}

function hslControls(e) {
	const index =
		e.target.getAttribute('data-brightness') ||
		e.target.getAttribute('data-saturation') ||
		e.target.getAttribute('data-hue');

	let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
	const hue = sliders[0];
	const brightness = sliders[1];
	const saturation = sliders[2];

	const bgColour = initialColours[index];

	let colour = chroma(bgColour)
		.set('hsl.s', saturation.value)
		.set('hsl.l', brightness.value)
		.set('hsl.h', hue.value);

	colourDivs[index].style.backgroundColor = colour;

	//colouring slider inputs
	sliderBackgrounds(colour, hue, brightness, saturation);
}

function updateTextUI(index) {
	const activeDiv = colourDivs[index];
	const colour = chroma(activeDiv.style.backgroundColor);
	const textHex = activeDiv.querySelector('h2');
	const icons = activeDiv.querySelectorAll('.controls button');

	textHex.innerText = colour.hex();

	//check contrast
	checkContrast(colour, textHex);
	for (icon of icons) {
		checkContrast(colour, icon);
	}
}

function resetInputs() {
	const sliders = document.querySelectorAll('.sliders input');
	sliders.forEach(slider => {
		if (slider.name === 'hue') {
			const hueColour = initialColours[slider.getAttribute('data-hue')];
			const hueValue = chroma(hueColour).hsl()[0];
			slider.value = Math.floor(hueValue);
		}
		if (slider.name === 'brightness') {
			const brightnessColour =
				initialColours[slider.getAttribute('data-brightness')];
			const brightnessValue = chroma(brightnessColour).hsl()[2];
			slider.value = Math.floor(brightnessValue * 100) / 100;
		}
		if (slider.name === 'saturation') {
			const saturationColour =
				initialColours[slider.getAttribute('data-saturation')];
			const saturationValue = chroma(saturationColour).hsl()[1];
			slider.value = Math.floor(saturationValue * 100) / 100;
		}
	});
}

function copyToClipboard(hex) {
	const element = document.createElement('textarea');
	element.value = hex.innerText;
	document.body.appendChild(element);
	element.select();
	document.execCommand('copy');
	document.body.removeChild(element);

	//pop up animation
	const popupBox = popup.children[0];
	popup.classList.add('active');
	popupBox.classList.add('active');
}

function openAdjustmentPanel(index) {
	sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
	sliderContainers[index].classList.remove('active');
}

function lockLayer(e, index) {
	const lockSVG = e.target.children[0];
	const activeBackground = colourDivs[index];
	activeBackground.classList.toggle('locked');

	if (lockSVG.classList.contains('fa-lock-open')) {
		e.target.innerHTML = '<i class="fas fa-lock"></i>';
	} else {
		e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
	}
}

//save palette and local storage
const saveButton = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryButton = document.querySelector('.library');
const closeLibraryButton = document.querySelector('.close-library');
const clearPalettesButton = document.querySelector('.clear-palettes');

submitSave.addEventListener('click', savePalette);
saveButton.addEventListener('click', openPalette);
closeSave.addEventListener('click', closePalette);
libraryButton.addEventListener('click', openLibrary);
closeLibraryButton.addEventListener('click', closeLibrary);
clearPalettesButton.addEventListener('click', clearPalettes);

function openPalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.add('active');
	popup.classList.add('active');
}

function closePalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.remove('active');
	popup.classList.remove('active');
}

function savePalette(e) {
	saveContainer.classList.remove('active');
	popup.classList.remove('active');
	const name = saveInput.value;
	const colours = [];
	currentHexes.forEach(hex => {
		colours.push(hex.innerText);
	});

	//creating an object from the palettes and pushing them to an array

	let paletteNumber;
	const paletteObjects = JSON.parse(localStorage.getItem('palletes'));
	if (paletteObjects) {
		paletteNumber = paletteObjects.length;
	} else {
		paletteNumber = savedPalettes.length;
	}

	const paletteObject = { name, colours, number: paletteNumber };
	savedPalettes.push(paletteObject);

	//saving to local storage
	saveToLocal(paletteObject);
	saveInput.value = '';

	const palette = document.createElement('div');
	palette.classList.add('custom-palette');
	const title = document.createElement('h4');
	title.innerText = paletteObject.name;
	const preview = document.createElement('div');
	preview.classList.add('small-preview');
	paletteObject.colours.forEach(smallColour => {
		const smallDiv = document.createElement('div');
		smallDiv.style.backgroundColor = smallColour;
		preview.appendChild(smallDiv);
	});

	const paletteButton = document.createElement('button');
	paletteButton.classList.add('pick-palette-button');
	paletteButton.classList.add(paletteObject.number);
	paletteButton.innerText = 'Select';

	paletteButton.addEventListener('click', e => {
		closeLibrary();
		const paletteIndex = e.target.classList[1];
		initialColours = [];
		savedPalettes[paletteIndex].colours.forEach((colour, index) => {
			initialColours.push(colour);
			colourDivs[index].style.backgroundColor = colour;
			const text = colourDivs[index].children[0];
			checkContrast(colour, text);
			updateTextUI(index);
		});
		resetInputs();
	});

	//add to library
	palette.appendChild(title);
	palette.appendChild(preview);
	palette.appendChild(paletteButton);
	libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObject) {
	let localPalettes;
	if (localStorage.getItem('palettes') === null) {
		localPalettes = [];
	} else {
		localPalettes = JSON.parse(localStorage.getItem('palettes'));
	}
	localPalettes.push(paletteObject);
	localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary() {
	const popup = libraryContainer.children[0];
	libraryContainer.classList.add('active');
	popup.classList.add('active');
}

function closeLibrary() {
	const popup = libraryContainer.children[0];
	libraryContainer.classList.remove('active');
	popup.classList.remove('active');
}

function getLocal() {
	if (localStorage.getItem('palettes') === null) {
		localPalettes = [];
	} else {
		const paletteObjects = JSON.parse(localStorage.getItem('palettes'));

		savedPalettes = [...paletteObjects];
		paletteObjects.forEach(paletteObject => {
			const palette = document.createElement('div');
			palette.classList.add('custom-palette');
			const title = document.createElement('h4');
			title.innerText = paletteObject.name;
			const preview = document.createElement('div');
			preview.classList.add('small-preview');
			paletteObject.colours.forEach(smallColour => {
				const smallDiv = document.createElement('div');
				smallDiv.style.backgroundColor = smallColour;
				preview.appendChild(smallDiv);
			});
			const paletteButton = document.createElement('button');
			paletteButton.classList.add('pick-palette-button');
			paletteButton.classList.add(paletteObject.number);
			paletteButton.innerText = 'Select';

			paletteButton.addEventListener('click', e => {
				closeLibrary();
				const paletteIndex = e.target.classList[1];
				initialColours = [];
				paletteObjects[paletteIndex].colours.forEach((colour, index) => {
					initialColours.push(colour);
					colourDivs[index].style.backgroundColor = colour;
					const text = colourDivs[index].children[0];
					checkContrast(colour, text);
					updateTextUI(index);
				});
				resetInputs();
			});

			//add to library
			palette.appendChild(title);
			palette.appendChild(preview);
			palette.appendChild(paletteButton);
			libraryContainer.children[0].appendChild(palette);
		});
	}
}

function clearPalettes() {
	localStorage.clear();
	location.reload();
}

// INVOKING FUNCTIONS
randomColours();
getLocal();
