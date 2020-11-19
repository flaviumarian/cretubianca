// TextArea auto-resize 
const textAreas = document.getElementsByTagName('textarea');

for (let i = 0; i < textAreas.length; i++) {
    textAreas[i].setAttribute('style', 'height:' + (textAreas[i].scrollHeight) + 'px;overflow-y:hidden;');
    textAreas[i].addEventListener("input", OnInput, false);
    textAreas[i].onChange = function(){
        if(this.value == ''){
            alert('You must supply a value for this field');
         }
    };
}



function OnInput() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  }

  function createImageName(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789-';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    result += ".jpg";
    return result;
 }