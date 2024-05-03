const originalDot = document.querySelector('.dot');
const dotList = [];
const dotSize = 45;
const screenWidth = document.documentElement.clientWidth;
const screenHeight = document.documentElement.clientHeight;
const xCount = Math.floor(screenWidth / dotSize);
const yCount = Math.floor(screenHeight / dotSize);

for (let i = 0; i < yCount; i++) {
    for (let j = 0; j < xCount; j++) {
        const temp = originalDot.cloneNode(true);
        temp.style.top = i * dotSize + 'px';
        temp.style.left = j * dotSize + 'px';
        dotList.push(temp);
        document.body.appendChild(temp);
    }
}

originalDot.style.display = 'none';

document.onpointermove = event => {
    dotBig(event);
};

function dotBig(event) {
    const { clientX, clientY } = event;
    dotList.forEach(dot => {
        const rect = dot.getBoundingClientRect();
        const hyp = Math.hypot(clientX - rect.left, clientY - rect.top) / 100;
        let dotSize = 0.15;
        let translateDistanceX = 0;
        let translateDistanceY = 0;

        if (hyp < 2) {
            dotSize = sizeFunction(hyp);
            translateDistanceX = -(clientX - rect.left) / 35;
            translateDistanceY = -(clientY - rect.top) / 35;
        }

        dot.style.transform = `scale(${dotSize}) translate(${translateDistanceX}px, ${translateDistanceY}px)`;
    });
}

function sizeFunction(x) {
    return 5 / (Math.pow(Math.abs(x), 3) + 1);
}
