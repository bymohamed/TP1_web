
import './lib/webaudio-controls.js';

const getBaseURL = () => {
    return new URL('.', import.meta.url);
};

let style = `
// ici des règles CSS
`;
let template = /*html*/`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" integrity="sha384-1BmE4kWBq78iYhFldvKuhfTAU6auU8tT94WrHftjDbrCEXSU1oBoqyl2QvZ6jIW3" crossorigin="anonymous">
  <video id="player" crossorigin="anonymous">
      <br>
  </video>
  <br>
  <button id="play" class="btn btn-primary">PLAY</button>
  <button id="pause" class="btn btn-danger">PAUSE</button>

  <label for="volume" class="form-label">volume</label>
  <input type="range" min="0" max="100" value="50" id="volume">
  <output id="volLevel">50</output>


  <button id="info" class="btn btn-info">GET INFO</button>
  <button id="avance10" class="btn btn-light">+10s</button>

    <select name="speed" id="speed" class="bg-info">
        <option value="0.25">x0.25</option>
        <option value="0.5">x0.5</option>
        <option value="1" selected>x1</option>
        <option value="2">x2</option>
        <option value="4">x4</option>

    </select>


         <p id="infoField">info : </p>

    <label for="rightLeft" class="form-label">Balance: L</label>
    <input type="range" min="-100" max="100" value="0" id="rightLeft">
    <label for="rightLeft" class="form-label">R</label>




   `;

class MyVideoPlayer extends HTMLElement {
    constructor() {
        super();


        console.log("BaseURL = " + getBaseURL());

        this.attachShadow({ mode: "open" });
    }

    fixRelativeURLs() {
        // pour les knobs
        let knobs = this.shadowRoot.querySelectorAll('webaudio-knob, webaudio-switch, webaudio-slider');
        knobs.forEach((e) => {
            let path = e.getAttribute('src');
            e.src = getBaseURL() + '/' + path;
        });
    }
    connectedCallback() {
        // Appelée avant affichage du composant
        //this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.shadowRoot.innerHTML = `<style>${style}</style>${template}`;

        this.fixRelativeURLs();

        this.player = this.shadowRoot.querySelector("#player");
        // récupération de l'attribut HTML
        this.player.src = this.getAttribute("src");

        this.ctx = window.AudioContext || window.webkitAudioContext;



        // déclarer les écouteurs sur les boutons
        this.definitEcouteurs();
    }

    definitEcouteurs() {
        console.log("ecouteurs définis")
        let i=0;
        this.shadowRoot.querySelector("#play").onclick = () => {
            this.play();
            this.context = new this.ctx();
            if(i==0) this.buildAudioGraphPanner();
            i=1;

        }
        this.shadowRoot.querySelector("#pause").onclick = () => {
            this.pause();
        }

        this.shadowRoot.querySelector("#info").onclick = () => {
            this.getInfo();
        }

        this.shadowRoot.querySelector("#speed").onchange = (event) => {
            this.player.playbackRate = event.target.value;
        }

        this.shadowRoot.querySelector("#volume").oninput = (event) => {
            const vol = parseFloat(event.target.value);
            this.player.volume = vol / 100;

            var volLevel = this.shadowRoot.querySelector("#volLevel");
            volLevel.textContent = vol;
        }

        var audioSource=null;

        this.shadowRoot.querySelector("#rightLeft").oninput = (event) => {
            this.pannerNode.pan.value = event.target.value/100;
        }

    }

    getInfo() {
        var paragraph = this.shadowRoot.querySelector("#infoField");
        console.log("Durée de la vidéo : " + this.player.duration);
        console.log("Temps courant : " + this.player.currentTime);
        paragraph.textContent += "Video duration :" + this.player.duration + "\n";
        paragraph.textContent += "Current Time :" + this.player.currentTime + "\n";
    }

    // API de mon composant
    play() {
        this.player.play();
        
    }

    buildAudioGraphPanner(){
        
    // create source and gain node
    this.source = this.context.createMediaElementSource(this.player);
    this.pannerNode = this.context.createStereoPanner();
  
    // connect nodes together
    this.source.connect(this.pannerNode);
    this.pannerNode.connect(this.context.destination);
    }

    pause() {
        this.player.pause();
    }



}

customElements.define("my-player", MyVideoPlayer);
