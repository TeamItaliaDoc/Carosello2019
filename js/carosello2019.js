var giorni = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
var calcolaClassificaRun = false;
var nQualificati = 0;

var matchs = [];
matchs[101] = {"turno":1, "girone":1, "nome":"il-carosello-1deg-turno-girone-1", "daCaricare":true, "stampaPosizione" : 0};
matchs[102] = {"turno":1, "girone":2, "nome":"il-carosello-1deg-turno-girone-2", "daCaricare":true, "stampaPosizione" : 0};
matchs[103] = {"turno":1, "girone":3, "nome":"il-carosello-1deg-turno-girone-3", "daCaricare":true, "stampaPosizione" : 0};
matchs[104] = {"turno":1, "girone":4, "nome":"il-carosello-1deg-turno-girone-4", "daCaricare":true, "stampaPosizione" : 0};
matchs[105] = {"turno":1, "girone":5, "nome":"il-carosello-1deg-turno-girone-5", "daCaricare":true, "stampaPosizione" : 0};
matchs[106] = {"turno":1, "girone":6, "nome":"il-carosello-1deg-turno-girone-6", "daCaricare":true, "stampaPosizione" : 0};

/*
matchs[101] = {"turno":1, "girone":1, "nome":"il-calvario-stazione-n-1-gruppo-1", "daCaricare":true, "stampaPosizione" : 0};
matchs[102] = {"turno":1, "girone":2, "nome":"il-calvario-stazione-n-1-gruppo-3", "daCaricare":true, "stampaPosizione" : 0};
matchs[103] = {"turno":1, "girone":3, "nome":"il-calvario-stazione-n-1-gruppo-4", "daCaricare":true, "stampaPosizione" : 0};
matchs[104] = {"turno":1, "girone":4, "nome":"il-calvario-stazione-n-1-gruppo-5", "daCaricare":true, "stampaPosizione" : 0};
matchs[105] = {"turno":1, "girone":5, "nome":"il-calvario-stazione-n-1-gruppo-6", "daCaricare":true, "stampaPosizione" : 0};
matchs[106] = {"turno":1, "girone":6, "nome":"il-calvario-stazione-n-1-gruppo-7", "daCaricare":true, "stampaPosizione" : 0};
**/
var maxGirone1 = 6;   //E' il numero dei gironi 

//-------- DATA FINE TURNO ----
//-------- DATA FINE TURNO ----
//-------- DATA FINE TURNO ----
//Classifica giocatori vale turno 3?

//https://api.chess.com/pub/tournament/csp-inverno-2018-2019-girone-1/1/1

function elabora() {
    //Carico i dati di tutti i match
    for (var i in matchs) {
        matchs[i].url = 'https://api.chess.com/pub/tournament/' + matchs[i].nome + '/1/1'
        caricaMatch(matchs[i].url);
    };
}

function caricaMatch(url)
{
    //Leggo i dati 
    $.getJSON(url,function(data){

        //Cerco match elaborato
        var iMatch = 0
        for (var i in matchs) {
            if (this.url == matchs[i].url && matchs[i].daCaricare)
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
            if (matchs[i].url == this.url)
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
    var oldSpareggio = -1;  //Per evitare problemi se sono tutti a zero
    var iGirone = 1;
  
    //Imposto posizione nel gruppo e salvo
    while (max > -1)
    {
        max = -1;
        maxSpareggio = -1;
        for (var i in giocatori)
        {
            if ((giocatori[i].turni[1].girone == iGirone & giocatori[i].turni[1].posizioneGruppo == 0) & (giocatori[i].turni[1].punti > max || (giocatori[i].turni[1].punti == max) && giocatori[i].turni[1].puntiSpareggio > maxSpareggio)) {
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

            //I primi due sono sempre qualificati
            if (posizione < 3) {
                giocatori[username].turni[1].qualificato = 1;
                nQualificati ++;
            }
            //Salvo posizione nel gruppo
            giocatori[username].turni[1].posizioneGruppo = posizione;
        } else {
            //Finito il calcolo di un girono
            if (iGirone < maxGirone1) {
                iGirone++;
                max = 0; //Devo calcolare girone successivo
                maxSpareggio = 0;
                posizione = 0;
                nPareggi = 0;
                oldMax = 0;
                oldSpareggio = -1;  //Per evitare problemi se sono tutti a zero
            }

        }
    }
    
    //Calcolo migliori dei terzi
    username = '';
    max = 0;
    maxSpareggio = 0;
    posizione = 0;
    nPareggi = 0;
    oldMax = 0;
    oldSpareggio = -1;  //Per evitare problemi se sono tutti a zero
    iGirone = 1;
    var maxQualificati = 0;
    var maxQualificatiSpareggio = 0;
    while (max > -1)
    {
        max = -1;
        maxSpareggio = -1;
        for (var i in giocatori)
        {
            if ((giocatori[i].turni[1].qualificato == 0) && (giocatori[i].turni[1].punti > max || (giocatori[i].turni[1].punti == max) && giocatori[i].turni[1].puntiSpareggio > maxSpareggio)) {
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

            //I primi due sono sempre qualificati
//            if (nQualificati < 16 || (maxQualificati == max & maxQualificatiSpareggio == maxSpareggio)) {
            if (nQualificati < 16) {
                giocatori[username].turni[1].qualificato = 2;
                nQualificati++;
                maxQualificati = max;
                maxQualificatiSpareggio = maxSpareggio;
            } else {
                giocatori[username].turni[1].qualificato = 3;
            }

        } else {
            //Finito il calcolo di un girono
            if (iGirone < maxGirone1) {
                iGirone++;
                max = 0; //Devo calcolare girone successivo
                maxSpareggio = 0;
                posizione = 0;
                nPareggi = 0;
                oldMax = 0;
                oldSpareggio = -1;  //Per evitare problemi se sono tutti a zero
            }

        }
    }

    //Stampo
    max = 999;
    username = '';
    posizione = 0;
    iGirone = 1;
    while (max < 1000)
    {
        //Stampo il girone
        if (max == 999) {
            $("#turno1").append('<tr><td><a style="font-weight: bold" href="https://www.chess.com/tournament/' + matchs[100+iGirone].nome + '/pairings" target=”_blank”>Girone ' + iGirone + '</a></td></tr>');
        }

        max = 1000;
        for (var i in giocatori)
        {
            if ((giocatori[i].turni[1].girone == iGirone) && (giocatori[i].turni[1].daStampare) && (giocatori[i].turni[1].posizioneGruppo < max)) {
                username = i;
                max = giocatori[i].turni[1].posizioneGruppo;
            }
        }
        if (max < 1000) 
        {
            giocatori[username].turni[1].daStampare = false;
            //Stampo il giocatore
            stampaGiocatoreTurno1(username);
            
        } else {
            //Finito il calcolo di un girono
            if (iGirone < maxGirone1) {
                max = 999; //Devo calcolare girone successivo
                iGirone++;
                posizione = 0;
            }

        }
    }

    //Calcolo e stampo la classifica dei giocatori
     calcolaClassificaGiocatori();
}
 
function stampaGiocatoreTurno1(username)
{
    var semaforo = '';
    if (giocatori[username].turni[1].qualificato == 1)
        semaforo +=  'verde.png'
    if (giocatori[username].turni[1].qualificato == 2)
        semaforo +=  'giallo.png'
    if (giocatori[username].turni[1].qualificato == 3)
        semaforo +=  'rosso.png'

    //stampo riga    
    $("#turno1").append('<tr class="classifica-giocatori">' +
        '<td class="classifica-col1"><img class="classifica-avatar" src="img/' + semaforo + '"></td>' +  
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
