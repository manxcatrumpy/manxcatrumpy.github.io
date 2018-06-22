function keyDown(e) {
    console.log("keyDown code: " + e.keyCode);
    console.log("keyDown name: " + e.key);
}

function keyPress(e) {
    console.log("keyPress code: " + e.keyCode);
    console.log("keyPress name: " + e.key);
}

function keyRelease(e) {
    console.log("keyRelease code: " + e.keyCode);
    console.log("keyRelease name: " + e.key);
}

window.onload = function () {
    window.addEventListener('keydown',this.keyDown, false);
    window.addEventListener('keypress',this.keyPress, false);
    window.addEventListener('keyup',this.keyRelease, false);
};