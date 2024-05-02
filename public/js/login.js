divButton = document.querySelector('#buttonDiv')
buttonForRealzie = document.querySelector('#username-submit-button')
textInput = document.querySelector('#text-input')

textInput.addEventListener('input', () => {
    divButton.classList.remove('noclick')
    buttonForRealzie.removeAttribute("disabled");
    buttonForRealzie.classList.add('pointer-hover')
    textInput.removeEventListener("click", arguments.callee)
})