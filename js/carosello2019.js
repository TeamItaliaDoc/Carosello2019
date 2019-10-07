var giorni = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
var calcolaClassificaRun = false;
var nTerziQualificati = 0;

var matchs = [];
matchs[101] = {"turno":1, "girone":1, "nome":"il-carosello-1deg-turno-girone-1", "daCaricare":true, "stampaPosizione" : 0};
matchs[102] = {"turno":1, "girone":2, "nome":"il-carosello-1deg-turno-girone-2", "daCaricare":true, "stampaPosizione" : 0};
matchs[103] = {"turno":1, "girone":3, "nome":"il-carosello-1deg-turno-girone-3", "daCaricare":true, "stampaPosizione" : 0};
matchs[104] = {"turno":1, "girone":4, "nome":"il-carosello-1deg-turno-girone-4", "daCaricare":true, "stampaPosizione" : 0};
matchs[105] = {"turno":1, "girone":5, "nome":"il-carosello-1deg-turno-girone-5", "daCaricare":true, "stampaPosizione" : 0};
matchs[106] = {"turno":1, "girone":6, "nome":"il-carosello-1deg-turno-girone-6", "daCaricare":true, "stampaPosizione" : 0};
var maxPrimiGirone1 = 7;   //E' il numero dei gironi + 1

//-------- DATA FINE TURNO ----
//-------- DATA FINE TURNO ----
//-------- DATA FINE TURNO ----
//Classifica giocatori vale turno 3?

//https://api.chess.com/pub/tournament/csp-inverno-2018-2019-girone-1/1/1

function elabora() {
    //Carico i dati di tutti i match
    var url = '';
    for (var i in matchs) {
        url = 'https://api.chess.com/pub/tournament/' + matchs[i].nome + '/1/1';
        caricaMatch(url);
    };
}

function caricaMatch(url)
{
    //Leggo i dati 
    $.getJSON(url,function(data){

        //Cerco match elaborato
        var iMatch = 0
        for (var i in matchs) {
            if (this.url.indexOf(matchs[i].nome) > 0 && matchs[i].daCaricare)
            iMatch = i;
        }        

        //Creo tutti i giocatori per avere anche quelli senza punteggio
        for (var iPlayer in data.players) {
            if (! giocatori[data.players[iPlayer].username.toLowerCase()]) {
                creaGiocatore(data.players[iPlayer].username);
            }
            //Aggiorno match/girone giocato
            giocatori[data.players[iPlayer].username].turni[matchs[iMatch].turno].match = iMatch;
            giocatori[data.players[iPlayer].username].turni[matchs[iMatch].turno].girone = matchs[iMatch].girone;

        }

        //Carico i risultati delle partite
        for (var i in data.games) {

            //Classifica giocatori
            //   NB NB DA FARE PER PRIMA COSI' CREA IL GIOCATORE
            if (data.games[i].end_time) {
                setPunti(matchs[iMatch].turno, data.games[i].white.username.toLowerCase(), data.games[i].white.result, data.games[i].black.username);
                setPunti(matchs[iMatch].turno, data.games[i].black.username.toLowerCase(), data.games[i].black.result, data.games[i].white.username);
            }
        }


        matchs[iMatch].daCaricare = false;
        //Se ho caricato tutti i dati calcolo la classifica
        for (var i in matchs) {
            if (matchs[i].daCaricare) {
                return;
            }
        }
        
        //calcolo punti spareggio
        //calcolo punti spareggio
        //calcolo punti spareggio
        for (var username in giocatori)
        {
            //Per tutti i turni del carosello
            for (var iTurno=1; iTurno < 4; iTurno++) {
                for (var i in giocatori[username].turni[iTurno].userVinte)
                    giocatori[username].turni[iTurno].puntiSpareggio += giocatori[giocatori[username].turni[iTurno].userVinte[i]].turni[iTurno].punti;
                for (var ii in giocatori[username].turni[iTurno].userPatte)
                    giocatori[username].turni[iTurno].puntiSpareggio += giocatori[giocatori[username].turni[iTurno].userPatte[ii]].turni[iTurno].punti / 2;
            }
        }

        //controllo di non aver già lanciato fase sucessiva
        if (calcolaClassificaRun)
            return;  
        calcolaClassificaRun = true;

        //Ricerco elo e stampo classifica torneo / giocatori
        getAvatar();
    
    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        //Se responseJSON non è valorizzato solo se il record esiste    
        var index = 0;
        for (var i in matchs) {
            if (matchs[i].url = this.url)
                index = i;
        };
        if (! jqXhr.responseJSON)
        {
            console.log('ERRORE ricarico dati: ' + this.url);
                caricaMatch(index, this.url);    
            } else {
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
                console.log('ERRORE Match non valida. ' + this.url);
                //non lo devo più caricare
                matchs[index].daCaricare = false;            }
              
        });
}

//Salva i punti del calvario
function setPuntiCarosello(username, turno, risultato, avversario) {
  /*      //gli username devono essere sempre in minuscolo
        username = username.toLowerCase();
        avversario = avversario.toLowerCase();
    
        //Se non esiste lo creo
        if (! giocatori[username]) {
            creaGiocatore(username);
        }
    
        //Se risultato non definito la partita non è finita
        if (! risultato)
            return;
    
        //aggiorno punteggio
        if ( risultato == 'win') {
            giocatori[username].punti ++;
            giocatori[username].vinte ++;
            giocatori[username].userVinte.push(avversario);
        } else {
            if ((risultato == 'agreed') || (risultato == 'repetition')  || (risultato == 'timevsinsufficient') || 
            (risultato == '50move') || (risultato == 'insufficient') || (risultato == 'stalemate')  ){
                    giocatori[username].punti += 0.5;
                    giocatori[username].patte ++;
                    giocatori[username].userPatte.push(avversario);
                } else {
                    giocatori[username].perse ++;
                }
        }
    }
    */
   calcolaClassificaTurno1;
}   

//calcolo classifica del secondo turno
function calcolaClassificaTurno2()
{
    //Calcolo e stampo la classifica dei giocatori
    calcolaClassificaTurno1();
}

//calcolo classifica del terzo turno
function calcolaClassificaTurno3()
{
/*  
    //Imposto posizione e salvo
    var username = '';
    var max = 0;
    while (max > -1)
    {
        max = -1;
        for (var i in giocatori)
        {
            if (!giocatori[i].stampaCalvario  && giocatori[i].puntiCalvario > max ) {
                username = i;
                max = giocatori[i].puntiCalvario;
            }
        }
        if (max > -1) 
        {
            giocatori[username].stampaCalvario = stampaCalvario;
            //Stampo il giocatore
            stampaCalvario(username);
        }
     }
*/    
    //Calcolo e stampo la classifica del turno1
    calcolaClassificaTurno2();
}

function calcolaClassificaTurno1()
{   
    var username = '';
    var max = 0;
    var maxSpareggio = 0;
    var posizione = 0;
    var nPareggi = 0;
    var oldMax = 0;
    var oldSpareggio = 0;

    var iPrimiGirone = 1;
    var iPrimi = 1;
  
    //Imposto posizione e salvo
    while (max > -1)
    {
        max = -1;
        maxSpareggio = -1;
        for (var i in giocatori)
        {
            //Se definito stampo prima i primi due del girone
            if (iPrimiGirone < maxPrimiGirone1 && giocatori[i].turni[1].girone != iPrimiGirone)
                continue;

            if ((giocatori[i].turni[1].posizione == 0) && (giocatori[i].turni[1].punti > max || (giocatori[i].turni[1].punti == max) && giocatori[i].turni[1].puntiSpareggio > maxSpareggio)) {
                username = i;
                max = giocatori[i].turni[1].punti;
                maxSpareggio = giocatori[i].turni[1].puntiSpareggio;
            }
        }
        if (max > -1) 
        {
            if (oldMax == max && oldSpareggio == maxSpareggio )
            {
                nPareggi++;
            } else {
                posizione++;
                posizione += nPareggi;
                nPareggi = 0;
                oldMax = max;
                oldSpareggio = maxSpareggio;
            }    
            
            giocatori[username].turni[1].posizione = posizione;
            //Salvo posizione nel gruppo
            matchs[giocatori[username].turni[1].match].stampaPosizione ++;
            giocatori[username].turni[1].posizioneGruppo = matchs[giocatori[username].turni[1].match].stampaPosizione;
            
            
            //Stampo il giocatore
            stampaGiocatoreTurno1(username);

            //Aggiorno se sto stampando i primi
            if (iPrimiGirone < maxPrimiGirone1) {
                //Calcolo successivo
                if (iPrimi == 1) {
                   iPrimi = 2;
                } else {
                   iPrimi = 1;
                   iPrimiGirone++;
                }
           }
            
        }
    }
   
     //Calcolo e stampo la classifica dei giocatori
     calcolaClassificaGiocatori();
}
 
function stampaGiocatoreTurno1(username)
{
    var stampaPosizione = '<a class="username" href="https://www.chess.com/tournament/' + matchs[giocatori[username].turni[1].match].nome + '/pairings" target=”_blank”>';
    var posizioneRomana = '';
    if (giocatori[username].turni[1].posizioneGruppo == 1) posizioneRomana = 'I';
    if (giocatori[username].turni[1].posizioneGruppo == 2) posizioneRomana = 'II';
    if (giocatori[username].turni[1].posizioneGruppo == 3) posizioneRomana = 'III';
    if (giocatori[username].turni[1].posizioneGruppo == 4) posizioneRomana = 'IV';
    if (giocatori[username].turni[1].posizioneGruppo == 5) posizioneRomana = 'V';
    if (giocatori[username].turni[1].posizioneGruppo == 6) posizioneRomana = 'VI';
    if (giocatori[username].turni[1].posizioneGruppo < 3 || nTerziQualificati < 4) {
        stampaPosizione += '<img class="calvario-img" src="img/check.png">';
        if (giocatori[username].turni[1].posizioneGruppo >= 3)
        nTerziQualificati ++;
    }
    stampaPosizione +=  '<BR> <span style="font-size: 10px;">' + posizioneRomana + ' Gruppo ' + giocatori[username].turni[1].girone + '</span>';

    //stampo riga    
    $("#turno1").append('<tr class="classifica-giocatori">' +
        '<td class="classifica-col1">' + stampaPosizione + '</td>' +  
        '<td class="giocatori-col1SEP"></td>' + 
        '<td class="classifica-col2">' +
        '    <table><tr>' +
        '        <td>' +
        '        <img class="classifica-avatar" src="' + giocatori[username].avatar + '">' +
        '    </td>' +
        '    <td width=7px></td>' +
        '    <td><div>' +
        '            <a class="username" href="' + giocatori[username].url + '" target=”_blank”> ' + giocatori[username].displayName + '</a>' +
        '        </div> <div>  (' + giocatori[username].elo + ') </div>' +
        '        </td>' +    
        '    </tr></table>' +
        '</td>' +
        '<td class="classifica-col3">' + giocatori[username].turni[1].punti +'</td>' +
        '<td class="classifica-col3">' + giocatori[username].turni[1].puntiSpareggio +'</td>' +
        '<td class="classifica-col4"> <span class="game-win">' +  giocatori[username].turni[1].vinte + ' W</span> /'+
        '<span class="game-lost">' +  giocatori[username].turni[1].perse + ' L</span> /' +
        '<span class="game-draw">' +  giocatori[username].turni[1].patte + ' D</span>' +
        '</td>' +
        '</tr>'
    );
}
