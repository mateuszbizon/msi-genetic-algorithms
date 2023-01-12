"use strict";
const wordText = document.getElementById("word-text");
const chanceNumber = document.getElementById("chance-number");
const submitText = document.querySelector(".submit-text");
const errorText = document.querySelector(".error-text");
const errorChances = document.querySelector(".error-chances");

const submitBtn = document.querySelector(".submit-btn");
const progressBtn = document.querySelector(".progress-btn");
const progressBox = document.querySelector(".progress-box");

const chanceList = document.querySelector('.chance-list');

// Src: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

function random(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);

	// The maximum is exclusive and the minimum is inclusive
	return Math.floor(Math.random() * (max - min)) + min;
}

function generateLetter() {
	const code = random(97, 123); // ASCII char codes
	return String.fromCharCode(code);
}

class Member {
	constructor(target) {
		this.target = target;
		this.keys = [];

		for (let i = 0; i < target.length; i += 1) {
			this.keys[i] = generateLetter();
		}
	}

	fitness() {
		let matches = 0;

		for (let i = 0; i < this.keys.length; i += 1) {
			if (this.keys[i] === this.target[i]) {
				matches += 1;
			}
		}

		return matches / this.target.length;
	}

	crossover(partner) {
		const { length } = this.target;
		const child = new Member(this.target);
		const midpoint = random(0, length);

		for (let i = 0; i < length; i += 1) {
			if (i > midpoint) {
				child.keys[i] = this.keys[i];
			} else {
				child.keys[i] = partner.keys[i];
			}
		}

		return child;
	}

	mutate(mutationRate) {
		for (let i = 0; i < this.keys.length; i += 1) {
			// If below predefined mutation rate,
			// generate a new random letter on this position.
			if (Math.random() < mutationRate) {
				this.keys[i] = generateLetter();
			}
		}
	}
}

class Population {
	constructor(size, target, mutationRate) {
		size = size || 1;
		this.members = [];
		this.mutationRate = mutationRate;

		for (let i = 0; i < size; i += 1) {
			this.members.push(new Member(target));
		}
	}

	evolve(generations) {
		for (let i = 0; i < generations; i += 1) {
			const pool = this._selectMembersForMating();
			this._reproduce(pool);
		}
	}

	_selectMembersForMating() {
		const matingPool = [];

		this.members.forEach(m => {
			// The fitter he/she is, the more often will be present in the mating pool
			// i.e. increasing the chances of selection
			// If fitness == 0, add just one member
			const f = Math.floor(m.fitness() * 100) || 1;

			for (let i = 0; i < f; i += 1) {
				matingPool.push(m);
			}
		});

		return matingPool;
	}

	_reproduce(matingPool) {
		for (let i = 0; i < this.members.length; i += 1) {
			// Pick 2 random members/parent from the mating pool
			const parentA = matingPool[random(0, matingPool.length)];
			const parentB = matingPool[random(0, matingPool.length)];

			// Perform crossover
			const child = parentA.crossover(parentB);

			// Perform mutation
			child.mutate(this.mutationRate);

			this.members[i] = child;
		}
	}
}

// Init function
function generate(populationSize, target, mutationRate, generations) {
	// Create a population and evolve for N generations
	const population = new Population(populationSize, target, mutationRate);
	population.evolve(generations);

	// Get the typed words from all members and find if someone was able to type the target
	const membersKeys = population.members.map(m => m.keys.join(""));
	const perfectCandidatesNum = membersKeys.filter(w => w === target);

	// Print the results
	console.log(membersKeys);
  membersKeys.forEach(element => {
    let item = document.createElement('li');
    item.classList.add('chance-list-item');
    item.innerHTML = `${element}`;
    chanceList.append(item);
  })

	submitText.textContent = `${ perfectCandidatesNum ? perfectCandidatesNum.length : 0} member(s) typed "${target}"`;
  submitText.style.visibility = 'visible'
}

function checkTextInput() {
	if (wordText.value === "") {
		errorText.textContent = "Pole nie może być puste";
		errorText.style.visibility = "visible";

		return false;
	}

	return true;
}

function checkChancesInput() {
	if (chanceNumber.value === "") {
		errorChances.textContent = "Pole musi być liczbą";
		errorChances.style.visibility = "visible";

		return false;
	}

	if (chanceNumber.value < 20) {
		errorChances.textContent = "Wartość musi być minimum 20";
		errorChances.style.visibility = "visible";

		return false;
	}

	return true;
}

function clearInputs() {
	wordText.value = "";
	chanceNumber.value = "";
	errorText.style.visibility = "hidden";
	errorChances.style.visibility = "hidden";
}

submitBtn.addEventListener("click", () => {
	if (!checkTextInput() || !checkChancesInput()) {
		submitText.textContent = "Uzupełnij wszystkie pola";
		submitText.style.visibility = "visible";

		return false;
	}

	generate(chanceNumber.value, wordText.value, 0.05, 200);
	// clearInputs();
});

progressBtn.addEventListener("click", () => {
	progressBox.classList.toggle("progress-box-active");
});
