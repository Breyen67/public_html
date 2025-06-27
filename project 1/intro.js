function myFunction() {
    const mytext1 = document.getElementById("mytext1");
    mytext1.innerHTML= "It works!";

    const mytext2 = document.getElementById("mytext2");
    mytext2.innerHTML = "This is my Script!"

    const myinput = document.getElementById("myinput")
    document.body.style.backgroundColor = myinput.value;

}

function changeTextColor() {
    const colorInput = document.getElementById("myinput2");
    const textToChange = document.getElementById("mytext3");
    textToChange.style.color = colorInput.value;
}
