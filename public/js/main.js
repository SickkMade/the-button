
const button = document.querySelector('.buttonDiv');
const needAnimation = document.querySelectorAll('.needAnim');
const boxResize = document.querySelector('.boxResize');
const buttonCount = document.querySelector('#score')
const maxCount = document.querySelector('#maxScore')
const clickAudio = document.querySelector("#click-audio")
const explosionAudio = document.querySelector("#explosion-audio")



button.addEventListener('mousedown', () => {
    needAnimation.forEach( element => {
        element.classList.add('buttonClickAnimation')
    })
    boxResize.classList.add('boxResizeAnimation')
    button.classList.add('shake');
});
button.addEventListener('mouseup', () => {
    needAnimation.forEach( element => {
        element.classList.remove('buttonClickAnimation')
    })
    boxResize.classList.remove('boxResizeAnimation')
    button.classList.remove('shake');
    onButtonClick()
});

async function onButtonClick(){
    //we are goin to maek button click change the size of button
    let scale = 0; 
    


    try{
        const response = await fetch('/updateButtonCount', {
            method:'put'
        })
        const data = await response.json()
        buttonCount.textContent = data.score
        maxCount.textContent = "Max Score: "+ data.maxScore
        
        scale = 0.85 + (0.01 * data.score)
        button.style.transform = `translate(-50%, -50%) scale(${scale})`;

        if(data.didFail) {
            explosionAudio.src = "sounds/explosion" + Math.floor(Math.random()* 3 +1) + ".wav"
            explosionAudio.play()
        } else{
            clickAudio.src = "sounds/click" + Math.floor(Math.random()* 3 +1) + ".wav"
            clickAudio.play()
        }
        

    } catch (err){
        console.error(err)
    }
    
}

function updateButtonCount(n){
    buttonCount.textContent = n
}