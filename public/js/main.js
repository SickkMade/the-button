
const button = document.querySelector('.buttonDiv');
const needAnimation = document.querySelectorAll('.needAnim');
const boxResize = document.querySelector('.boxResize');
const buttonCount = document.querySelector('#number')

button.addEventListener('mousedown', () => {
    needAnimation.forEach( element => {
        element.classList.add('buttonClickAnimation')
    })
    boxResize.classList.add('boxResizeAnimation')
});
button.addEventListener('mouseup', () => {
    needAnimation.forEach( element => {
        element.classList.remove('buttonClickAnimation')
    })
    boxResize.classList.remove('boxResizeAnimation')
    onButtonClick()
});

async function onButtonClick(){

    try{
        const response = await fetch('/updateButtonCount', {
            method:'put'
        })
        const data = await response.json()
        updateButtonCount(data.score)
    } catch (err){
        console.error(err)
    }
    
}

function updateButtonCount(n){
    buttonCount.textContent = n
}