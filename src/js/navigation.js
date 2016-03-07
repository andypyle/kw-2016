export default class {
	constructor(navToggle, navContainer){
		this.navToggle = document.querySelectorAll(navToggle);
		this.navContainer = document.querySelectorAll(navContainer);
	}

	init(){
		let navToggle = this.navToggle[0];
		let navContainer = this.navContainer[0];
		navToggle.addEventListener('click', (e) => {
			e.preventDefault();
			navToggle.classList.toggle('Navigation__toggle--open');
			navContainer.classList.toggle('Navigation__container--open');
		});
	}
}