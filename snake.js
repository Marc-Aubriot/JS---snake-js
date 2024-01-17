// 1 - Créer le plateau de coordonnées (1 array colonne 16, 1 array row 16, 1 array position en chiffre (1>256 position max)) target div de classe snakeRealm - OK
/*  a - une explication rapide du but du jeu et du fonctionnement en début de jeu - OK
    b - un bouton commencer le jeu/ recommencer - OK
    c - Quand on lance le jeu, le plateau se créer avec comme target l'div de classe 'snakeBox', spawn un plateau de 16*16 = 256 cases - OK
*/

const snakeRealm = document.querySelector('.snakeRealm'); //target où sera le jeu dans le HTML

const snakeBox = document.createElement('div'); // creer la fenêtre de jeu
snakeBox.classList = 'snakeBox';
snakeRealm.appendChild(snakeBox);

const tutorial = document.createElement('div'); //créer une fenêtre, devant la snakeBox, qui explique le but du jeu et les touches, et loge le bouton jouer
tutorial.classList = 'tutorialBox'; 
snakeBox.appendChild(tutorial);

const para = document.createElement('p'); //l'explication du jeu et des touches
para.textContent =  `Vous \u00eates le serpent et vous devez manger le plus de pomme possible. Attention \u00e0 ne pas vous manger vous m\u00eame ! Pour avancer appuyez sur les touches directionnelles.`;
tutorial.appendChild(para);

const scoreBox = document.createElement('div'); //créer le display du score en bas de l'ecran
scoreBox.classList = 'scoreBox';
snakeRealm.appendChild(scoreBox);
const score = document.createElement('p');
score.textContent = `Score : 0`;
scoreBox.appendChild(score);
const minutes = document.createElement('label');
minutes.id = 'minutes';
scoreBox.appendChild(minutes);

const playBtn = document.createElement('button'); //créer le bouton pour lancer le jeu
playBtn.textContent = 'Jouer';
playBtn.classList = 'playBtn';
playBtn.id = 'boutonUn';
playBtn.addEventListener('click', function() { track5.play(); lunchGame(); this.parentNode.remove(); });
tutorial.appendChild(playBtn);

var menu = true;
var plateau = [];
var intervalID;
var Over = false;

var snake = [[5,5],[4,5],[3,5],[2,5]]; //coordoonées x,y de chaque élément du snake
var tempSnakeQueue = snake[snake.length-1];
var coordX = 5; // coordonnées X de la tête du serpent
var coordY = 5; // coordonnées Y de la tête du serpent
var direction = 'droite'; // direction du serpent
var pomme;
var stockPomme = [];
var pommeCount = 0;
var minutesLabel = document.getElementById("minutes");
var secondsLabel;/*= document.getElementById("seconds");*/
var totalSeconds = 0;
var audioOnOff = false;
var sample;
var pause = false;
var difficultyLvl = 0;
var stockMegaPomme = [];
var megaPomme = false;
var megaPommeTimer;

function lunchGame() { //lance le jeu en créer le plateau

    for ( let x = 0; x < 16; x++ ) { // créer les 16 colonnes du plateau et les 16 lignes du plateau 
        plateau[x] = new Array();

        for ( let y = 0; y <16; y++ )  { // rempli les colonnes et lignes de 0 qui indiqueront que le serpent n'est pas là 
            plateau[x][y] = 0;

            const para = document.createElement('p'); //display grid
            para.textContent = ``;
            para.id = `${[x]} ${[y]}`;
            snakeBox.appendChild(para);
        }
    }

    let X = Math.floor(Math.random()*16);
    let Y = Math.floor(Math.random()*16);
    stockPomme[0] = X;
    stockPomme[1] = Y;
    pomme = true;
    
    if ( audioOnOff == true && menu == true ) { 
        audio('MGS','btnPlayer1'); // éteint
        scoreBox.appendChild(playAudioBtn2);
        audio('theme','btnPlayer2'); //allume
    } else if ( audioOnOff == false && menu == true ) {
        scoreBox.appendChild(playAudioBtn2);
    }

    plateauRendering();
    horlogeID = setInterval(setTime, 1000);
    intervalID = setInterval(timer, 250);// sert à tick le plateau toutes les demi secondes 
    menu = false;
}

function plateauRendering() {

    for ( let x = 0; x < 16; x++ ) { // créer les 16 colonnes du plateau et les 16 lignes du plateau 

        for ( let y = 0; y < 16; y++ )  { // rempli les colonnes et lignes de 0 qui indiqueront que le serpent n'est pas là 
            plateau[x][y] = 0;        
        }
    }

    for ( i = 0; i <= snake.length-1; i++ ) { //récupère les coordonnées de chaque élément du serpent et l'input dans le plateau
        plateau[snake[i][1]][snake[i][0]] = 1;
    }

    if ( pomme === true ) { plateau[stockPomme[0]][stockPomme[1]] = 2; }
    if ( megaPomme === true ) { plateau[stockMegaPomme[0]][stockMegaPomme[1]] = 3; }

    for ( let x = 0; x < 16; x++ ) { // créer les 16 colonnes du plateau et les 16 lignes du plateau 

        for ( let y = 0; y < 16; y++ )  { // display en noir si le serpent est absent, et vert si il est présent
            if ( plateau[x][y] === 0 ) { 
                document.getElementById(`${[x]} ${[y]}`).style.backgroundColor = 'black';
            } else if ( plateau[x][y] === 1 ) {
                document.getElementById(`${[x]} ${[y]}`).style.backgroundColor = 'green'; 
            } else if ( plateau[x][y] === 2 ) {
                document.getElementById(`${[x]} ${[y]}`).style.backgroundColor = 'red'; 
            } else if ( plateau[x][y] === 3 ) {
                document.getElementById(`${[x]} ${[y]}`).style.backgroundColor = 'Yellow'; 
            }
        }
    }
}

// 2 - Créer le snake qui spawn à pt fixe (4 case de long)
/*  a - une fonction déplacement qui est updater à chaque tick en fonction des inputs clavier - OK
    b - une fonction check coordoonées qui nous dira ou se trouve le snake - OK
*/

function deplacementSnake() { //check la direction du snake, ajoute une case dans le direction sur le plateau, et suprimme la queue du snake sur le plateau
    let skip = 0;

     for ( j = 0; j < plateau[0].length; j++ ) { //check les sorties de bord
        if ( snake[0][0] == [j] && snake[0][1] == 0 && direction == 'haut' ) {
            coordX = j;
            coordY = 15;
            skip = 1;
        } else if ( snake[0][0] == 0 && snake[0][1] == [j] && direction == 'gauche' ) {
            coordX = 15;
            coordY = j;
            skip = 1;
        } else if ( snake[0][0] == [j] && snake[0][1] == plateau.length-1 && direction == 'bas' ) {
            coordX = j;
            coordY = 0;
            skip = 1;
        } else if ( snake[0][0] == plateau.length-1 && snake[0][1] == [j] && direction == 'droite' ) {
            coordX = 0;
            coordY = j;
            skip = 1;
        }
    }
    
    if ( direction == 'gauche' && skip ==  0 ) { //update les coordonnées 
        coordX--;
    } else if ( direction == 'haut' && skip ==  0 ) {
        coordY--;
    } else if ( direction == 'droite' && skip ==  0 ) {
        coordX++;
    } else if ( direction == 'bas' && skip ==  0 ) {
        coordY++;
    }


    let arrayTemp = [coordX,coordY];
    snake.unshift(arrayTemp);
    snake.pop();

    plateau[coordY][coordX] = 1; //rajoute une tête sur le plateau
    plateau[snake[snake.length-1][1]][snake[snake.length-1][0]] = 0; //coupe une queue sur le plateau
}

// 3 - Créer les pommes, qui doivent spawn 1 par 1 à chaque fois que le snake mange une (spawn random dans une case)
/*  a - un compteur de pomme mangé pour suivre le score
    b - une fonction pomme ? qui fait grandir le snake et spawn une nouvelle pomme - OK
*/ 

function pommeSpawn() {

    if ( pomme === false ) {
        let X = Math.floor(Math.random()*16);
        let Y = Math.floor(Math.random()*16);
        stockPomme[0] = X;
        stockPomme[1] = Y;
        pomme = true;
    } 

    var megaPommeSpawnTimer = Math.floor(Math.random()*10 + 10);
    
    if ( pommeCount == megaPommeSpawnTimer && megaPomme == false ) {
        let X = Math.floor(Math.random()*16);
        let Y = Math.floor(Math.random()*16);
        stockMegaPomme[0] = X;
        stockMegaPomme[1] = Y;
        megaPomme = true;
        megaPommeTimer = setTimeout(function() { megaPomme = false; }, 3000);
    }
}

function mangerDesPommes() {
   
    if ( stockPomme[1] === snake[0][0] && stockPomme[0] === snake[1][1] ) {
        snake.push(tempSnakeQueue);
        pomme = false;
        pommeCount++;
        score.textContent = `Score : ${pommeCount}`;
        difficultyRise();
        track4.play();
    }
    
    if ( stockMegaPomme[1] === snake[0][0] && stockMegaPomme[0] === snake[1][1] && megaPomme == true) {
        snake.push(tempSnakeQueue);
        megaPomme = false;
        pommeCount = pommeCount + 10;
        score.textContent = `Score : ${pommeCount}`;
        difficultyRise();
        track4.play();
    }
}

const difficultyDisplay = document.createElement('p');
difficultyDisplay.textContent = `Difficult\u00e9 : ${difficultyLvl}`;
scoreBox.appendChild(difficultyDisplay);

function difficultyRise() {
    
    if ( pommeCount >= 10 & difficultyLvl == 0 ) {
        difficultyLvl++;
        clearInterval(intervalID);
        intervalID = setInterval(timer, 200);
    } else if ( pommeCount >= 20 & difficultyLvl == 1 ) {
        difficultyLvl++;
        clearInterval(intervalID);
        intervalID = setInterval(timer, 150);
    } else if ( pommeCount >= 30 & difficultyLvl == 2 ) {
        difficultyLvl++;
        clearInterval(intervalID);
        intervalID = setInterval(timer, 100);
    } else if ( pommeCount >= 40 & difficultyLvl == 3 ) {
        difficultyLvl++;
        clearInterval(intervalID);
        intervalID = setInterval(timer, 50);
    }
    
    difficultyDisplay.textContent = `Difficult\u00e9 : ${difficultyLvl}`;
}
// 4 - Créer le temps, chaque tick le snake avance (un timer, à chaque tick check la position du snake, si la tête est sur le corps c'est game over, si le snake mange le bord c'est game over, si le snake mange une pomme, la pomme disparait, une nouvelle apparait et le snake devient plus long d'une case)
/*  a - une fonction Timer ? - OK
    b - une fonction game Over - OK
*/


function timer() {
    tempSnakeQueue = snake[snake.length-1];

    pommeSpawn();
    gameOver();
    if ( Over === true ) { clearInterval(intervalID); clearInterval(horlogeID); return; }

    deplacementSnake();
    mangerDesPommes();
    plateauRendering();
}


function gameOver() { //check la position du snake sur la plateau pour une sortie de bord et check la position du snake sur lui même

    for ( i = 1; i <= snake.length-1; i++ ) { //check la position de la tête par rapport aux autres elements du snake
        if ( snake[i][0] === snake[0][0] && snake[i][1] === snake[0][1] ) {

                const deathDisplay = document.createElement('div');
                deathDisplay.classList = 'deathBox';
                snakeBox.appendChild(deathDisplay);
            
                const para = document.createElement('p');
                para.textContent = 'Game Over';
                deathDisplay.appendChild(para);

                ranking(deathDisplay);

                const doOverBtn = document.createElement('button'); //créer le bouton pour lancer le jeu
                doOverBtn.textContent = 'Recommencer';
                doOverBtn.id = 'doOverBtn';
                doOverBtn.addEventListener('click', function() { 
                    track5.play(); resetVar(); lunchGame(); this.parentNode.remove(); });
                deathDisplay.appendChild(doOverBtn);

                track3.play();
                Over = true;
        }
    }
}

function resetVar() {
    plateau = [];
    intervalID;
    pause = false;
    difficultyLvl = 0;
    difficultyDisplay.textContent = `Difficult\u00e9 : ${difficultyLvl}`;

    stockMegaPomme = [];
    megaPomme = false;
    megaPommeTimer;

    snake = [[5,5],[4,5],[3,5],[2,5]]; //coordoonées x,y de chaque élément du snake
    coordX = 5; // coordonnées X de la tête du serpent
    coordY = 5; // coordonnées Y de la tête du serpent
    direction = 'droite'; // direction du serpent

    pomme;
    stockPomme = [];
    pommeCount = 0;
    score.textContent = `Score : ${pommeCount}`;

    Over = false;
    tempSnakeQueue = snake[snake.length-1];
    
    minutesLabel = document.getElementById("minutes");
    secondsLabel; /*= document.getElementById("seconds");*/
    totalSeconds = 0;
    minutes.textContent = `${minutesLabel} : ${secondsLabel}`;

    menu = false;
    audioOnOff = false;
    sample = '';
}

// 5 - Features
/*  a - une page de score ? un systeme de player ? (chaque joueur rentre son nom)
    b - selection de la difficulté (jouer> difficulté > début du jeu )
*/



function setTime() {
  ++totalSeconds;
  secondsLabel = pad(totalSeconds % 60);
  minutesLabel = pad(parseInt(totalSeconds / 60));
  minutes.textContent = `${minutesLabel} : ${secondsLabel}`;
}

function pad(val) {
  var valString = val + "";
  if (valString.length < 2) {
    return "0" + valString;
  } else {
    return valString;
  }
}


// KEYBOARD SUPPORT
document.addEventListener('keydown', keyLog, false);
function keyLog(e) {
    let keyCode = e.keyCode;

    if ( keyCode === 37 ) { if ( direction == 'droite' ) { return; } else { direction = 'gauche'; }} //gauche
    if ( keyCode === 38 ) { if ( direction == 'bas' ) { return; } else { direction = 'haut'; }} // haut
    if ( keyCode === 39 ) { if ( direction == 'gauche' ) { return; } else { direction = 'droite'; }} // droite
    if ( keyCode === 40 ) { if ( direction == 'haut' ) { return; } else { direction = 'bas'; }} // bas

}
  
// GAMEPAD SUPPORT via librairy
var gamepad = new Gamepad();

gamepad.bind(Gamepad.Event.CONNECTED, function(device) {
    // a new gamepad connected

    /*const para = document.createElement('p');
    para.textContent = `Manette ${device} détectée.`;
    para.id = 'gamepadDetectOK';
    para.classList = 'optionsQuickDisplay';
    tutorial.appendChild(para);

    setTimeout(() => {
        document.getElementById('gamepadDetectOK').remove();
    }, 4000);*/
});

gamepad.bind(Gamepad.Event.DISCONNECTED, function(device) {
    // gamepad disconnected
});

gamepad.bind(Gamepad.Event.UNSUPPORTED, function(device) {
    // an unsupported gamepad connected (add new mapping)
});

gamepad.bind(Gamepad.Event.BUTTON_DOWN, function(e) {
    // e.control of gamepad e.gamepad pressed down
    console.log(e.control);
    if ( e.control == 'DPAD_RIGHT' ) { if ( direction == 'gauche' ) { return; } else { direction = 'droite'; } };
    if ( e.control == 'DPAD_LEFT' ) { if ( direction == 'droite' ) { return; } else { direction = 'gauche'; } };
    if ( e.control == 'DPAD_UP' ) { if ( direction == 'bas' ) { return; } else { direction = 'haut'; } };
    if ( e.control == 'DPAD_DOWN' ) { if ( direction == 'haut' ) { return; } else { direction = 'bas'; } };
    if ( e.control == 'START_FORWARD' && menu == true ) { 
        track5.play();
        lunchGame(); 
        document.getElementById('boutonUn').parentNode.remove(); 
    } else if ( e.control == 'START_FORWARD' && Over == true ) {
        track5.play();
        resetVar();
        lunchGame();
        document.getElementById('doOverBtn').parentNode.remove(); 
    } else if  ( e.control == 'START_FORWARD' && pause == false ) { 
        track5.play();
        const pausePara = document.createElement('p');
        pausePara.textContent = 'PAUSE';
        pausePara.id = 'pausePara';
        snakeBox.appendChild(pausePara);

        clearInterval(intervalID); 
        clearInterval(horlogeID); 
        pause = true;
    } else if  ( e.control == 'START_FORWARD' && pause == true ) { 
        track5.play();
        document.getElementById('pausePara').remove();

        horlogeID = setInterval(setTime, 1000);
        intervalID = setInterval(timer, 250);// sert à tick le plateau toutes les demi secondes 

        pause = false;
    }
});

gamepad.bind(Gamepad.Event.BUTTON_UP, function(e) {
    // e.control of gamepad e.gamepad released
});

gamepad.bind(Gamepad.Event.AXIS_CHANGED, function(e) {
    // e.axis changed to value e.value for gamepad e.gamepad
});

gamepad.bind(Gamepad.Event.TICK, function(gamepads) {
    // gamepads were updated (around 60 times a second)
});

if (!gamepad.init()) {
    // Your browser does not support gamepads, get the latest Google Chrome or Firefox
}

// AUDIO
const playAudioBtn1 = document.createElement('button'); //bouton audio sur ecran d'accueil
playAudioBtn1.id = 'btnPlayer1';
playAudioBtn1.setAttribute('class','audioPlayer');
playAudioBtn1.addEventListener('click',function() { audio('MGS','btnPlayer1');})
tutorial.appendChild(playAudioBtn1);

const playAudioBtn2 = document.createElement('button'); //bouton audio ingame sur ecran des scores
playAudioBtn2.id = 'btnPlayer2';
playAudioBtn2.setAttribute('class','audioPlayer2');
playAudioBtn2.addEventListener('click',function() { audio('theme','btnPlayer2');})

function audio(trackID,btnID) { //sert à lire une piste audio
    if ( audioOnOff == false ) {
        sample = document.getElementById(trackID); 
        sample.play(); 
        audioOnOff = true;
        document.getElementById(`${btnID}`).style.backgroundImage = 'url(images/audioOn.png)';
    } else {
        audioOnOff = false;
        document.getElementById(`${btnID}`).style.backgroundImage = 'url(images/audioOff.png)';
        sample.pause();
    }
}

const track1 = document.createElement('audio'); // ecran d'accueil
track1.src = 'musique/MGS.mp3';
track1.id = 'MGS';
track1.loop = true;
snakeRealm.appendChild(track1);

const track2 = document.createElement('audio'); // ingame
track2.src = 'musique/Humble Match.ogg';
track2.id = 'theme';
track2.loop = true;
snakeRealm.appendChild(track2);

const track3 = document.createElement('audio'); // death
track3.src = 'musique/dead.wav';
track3.id = 'dead';
snakeRealm.appendChild(track3);

const track4 = document.createElement('audio'); // eat pomme
track4.src = 'musique/eat.wav';
track4.id = 'eat';
snakeRealm.appendChild(track4);

const track5 = document.createElement('audio'); // click btn
track5.src = 'musique/click.wav';
track5.id = 'click';
snakeRealm.appendChild(track5);

// Tableau des scores rang (classement 1 > 5 ), nom et score 
/*  a - pouvoir rentrer son nom sur l'écran des score 
    b - au gameovern, display le tableau des scores - OK
    c - classe le tableau - OK
*/


let tempStringScore = localStorage.getItem('scoreData');
if ( tempStringScore != null ) {
    let array1 = tempStringScore.split(',');
    let masterArray = [];
    for ( let i = 0; i<5; i++) {
        let array2 = array1.splice(0, 3);
        masterArray.push(array2);
    }

    var scoreDataArray = masterArray;
}

if ( scoreDataArray == null ) { scoreDataArray = [[1,' ',0], [2,' ',0], [3,' ',0], [4,' ',0], [5,' ',0]]; };

var userName;
userName = localStorage.getItem('userNameLS');


const registrerBtn = document.createElement('button');
registrerBtn.setAttribute('class','register');
if ( userName != null ) {
    registrerBtn.textContent = `${userName}`; 
    } else {
    registrerBtn.textContent = 'User'; 
};
registrerBtn.addEventListener('click', registerUser );
tutorial.appendChild(registrerBtn);

function registerUser() {
    let person = prompt("Please enter your name", "Harry Potter");
    let text;
    if (person == null || person == "") {
      text = "User cancelled the prompt.";
      person = "HP LoveCraft"
    }

    userName = person;
    registrerBtn.textContent = `${userName}`;
    localStorage.setItem('userNameLS',userName);
}

function ranking(targetDiv) {

    //RANKING
    let check = false;

    for ( let u = 0; u < 5; u++ ) { //check les 5 lignes
        let tempScoreArray = [];
        let rank = u+1;
        let name = userName;
        let score = pommeCount;
        tempScoreArray.push(rank);
        tempScoreArray.push(name);
        tempScoreArray.push(score);

        if ( score >= scoreDataArray[u][2] && check == false ) { //si meilleur score on insert dans la ligne
            scoreDataArray.splice(u, 0, tempScoreArray);
            check = true;
        }

        scoreDataArray[u][0] = u+1
    };

    if ( scoreDataArray.length > 5) { scoreDataArray.pop(); }; //garde que les 5 premiers



    // DISPLAY
    const rankingTable = document.createElement('div');
    rankingTable.setAttribute('class', 'rankingTable');
    targetDiv.appendChild(rankingTable);

    for ( let i = 0; i < 5; i++ ) { // rendering

        if ( i == 0 ) {
            const h3Rang = document.createElement('h3');
            h3Rang.textContent = `Rang`;
            rankingTable.appendChild(h3Rang);

            const h3Nom = document.createElement('h3');
            h3Nom.textContent = `Nom`;
            rankingTable.appendChild(h3Nom);

            const h3Score = document.createElement('h3');
            h3Score.textContent = `Score`;
            rankingTable.appendChild(h3Score);
        };


        const paraRang = document.createElement('p');
        paraRang.textContent = `${scoreDataArray[i][0]}`;
        rankingTable.appendChild(paraRang);

        const paraNom = document.createElement('p');
        paraNom.textContent = `${scoreDataArray[i][1]}`;
        rankingTable.appendChild(paraNom);

        const paraScore = document.createElement('p');
        paraScore.textContent = `${scoreDataArray[i][2]}`;
        rankingTable.appendChild(paraScore);

    };

    //localStorage.setItem('scoreDataDL',true);
    localStorage.setItem('scoreData',scoreDataArray);
};

