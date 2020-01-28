var giorni = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
var calcolaClassificaRun = false;
var nQualificati = 0;
var fineTurno1 = new Date(2019,11,30,12,0,0,0); 

var matchs = [];
matchs[101] = {"turno":1, "girone":1, "nome":"il-carosello-1deg-turno-girone-1", "daCaricare":true, "stampaPosizione" : 0};
matchs[102] = {"turno":1, "girone":2, "nome":"il-carosello-1deg-turno-girone-2", "daCaricare":true, "stampaPosizione" : 0};
matchs[103] = {"turno":1, "girone":3, "nome":"il-carosello-1deg-turno-girone-3", "daCaricare":true, "stampaPosizione" : 0};
matchs[104] = {"turno":1, "girone":4, "nome":"il-carosello-1deg-turno-girone-4", "daCaricare":true, "stampaPosizione" : 0};
matchs[105] = {"turno":1, "girone":5, "nome":"il-carosello-1deg-turno-girone-5", "daCaricare":true, "stampaPosizione" : 0};
matchs[106] = {"turno":1, "girone":6, "nome":"il-carosello-1deg-turno-girone-6", "daCaricare":true, "stampaPosizione" : 0};

matchs[201] = {"turno":2, "girone":1, "nome":"il-carosello-2deg-turno-girone-a", "daCaricare":true, "stampaPosizione" : 0};
matchs[202] = {"turno":2, "girone":2, "nome":"il-carosello-2deg-turno-girone-b", "daCaricare":true, "stampaPosizione" : 0};
matchs[203] = {"turno":2, "girone":3, "nome":"il-carosello-2deg-turno-girone-c", "daCaricare":true, "stampaPosizione" : 0};
matchs[204] = {"turno":2, "girone":4, "nome":"il-carosello-2deg-turno-girone-d", "daCaricare":true, "stampaPosizione" : 0};

var tabellaFinali = [];
var finali = [];
//finali[41] = {"white" : {"username":"laszlo1977", "result":"lost"}, "black" : {"username":"capfracassa", "result":"win"},}
//Se pari aggiungere un record con risulatato agreed, sarà valido solo per la classifica giocatori
finali[41] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[42] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[43] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[44] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[21] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[22] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}
finali[11] = {"white" : {"username":"", "result":""}, "black" : {"username":"", "result":""},}

var maxGirone1 = 6;   //E' il numero dei gironi 
var maxGirone2 = 4;   //E' il numero dei gironi 

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
                //controllo se non ha superato la data di fine torneo
                var myObj = $.parseJSON('{"date_created":"' + data.games[i].end_time + '"}'),
                end_time = new Date(1000*myObj.date_created);
                //Fine turno 1
                if (matchs[iMatch].turno == 1 && end_time > fineTurno1)
                   continue;    
                 
                //aggiorno punteggi
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

        //Carico partite delle finali
        caricaFinali();
    
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

function caricaFinali()
{
    //assegno i punteggi delle finali
    var i = 0
    for (var i in finali) {
        if (finali[i].white.result != '') {
            //aggiorno punteggi
            setPunti(3, finali[i].white.username.toLowerCase(), finali[i].white.result, finali[i].black.username);
            setPunti(3, finali[i].black.username.toLowerCase(), finali[i].black.result, finali[i].white.username);
        }
    }        

    //Ricerco elo e stampo classifica torneo / giocatori
    getAvatar();
}

//Salva i punti del carosello
function setPuntiCarosello(username, turno, risultato, avversario) {
   //Punti impostati in giocatori.js. Questa funzione è lanciata da giocatori.js
   calcolaClassificaTurno1;
}   

//calcolo classifica del secondo turno
function calcolaClassificaTurno2()
{
    var username = '';
    var max = 0;
    var maxSpareggio = 0;
    var posizione = 0;
    var nPareggi = 0;
    var oldMax = 0;
    var oldSpareggio = -1;  //Per evitare problemi se sono tutti a zero
    var iGirone = 1;
  
    //Nei punti spareggio conto anche le vittorie del turno 1
    for (var i in giocatori)
    {
        //Salvo spareggio per la stampa in colonna tie-break 
        giocatori[i].turni[2].puntiSpareggioVittorie = giocatori[i].turni[2].puntiSpareggio * 100 + giocatori[i].turni[1].vinte;
    }

    //Imposto posizione nel gruppo e salvo
    while (max > -1)
    {
        max = -1;
        maxSpareggio = -1;
        for (var i in giocatori)
        {
            if ((giocatori[i].turni[2].girone == iGirone & giocatori[i].turni[2].posizioneGruppo == 0) & (giocatori[i].turni[2].punti > max || (giocatori[i].turni[2].punti == max) && giocatori[i].turni[2].puntiSpareggioVittorie > maxSpareggio)) {
                username = i;
                max = giocatori[i].turni[2].punti;
                maxSpareggio = giocatori[i].turni[2].puntiSpareggioVittorie;   //Considero anche le vittorie
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
                giocatori[username].turni[2].qualificato = 1;
                nQualificati ++;
            }
            //Salvo posizione nel gruppo
            giocatori[username].turni[2].posizioneGruppo = posizione;
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
            $("#turno2").append('<tr><td><a style="font-weight: bold" href="https://www.chess.com/tournament/' + matchs[200+iGirone].nome + '/pairings" target=”_blank”>Girone ' + iGirone + '</a></td></tr>');
        }

        max = 1000;
        for (var i in giocatori)
        {
            if ((giocatori[i].turni[2].girone == iGirone) && (giocatori[i].turni[2].daStampare) && (giocatori[i].turni[2].posizioneGruppo < max)) {
                username = i;
                max = giocatori[i].turni[2].posizioneGruppo;
            }
        }
        if (max < 1000) 
        {
            giocatori[username].turni[2].daStampare = false;
            //Stampo il giocatore
            stampaGiocatoreTurno2(username);
            
        } else {
            //Finito il calcolo di un girono
            if (iGirone < maxGirone2) {
                max = 999; //Devo calcolare girone successivo
                iGirone++;
                posizione = 0;
            }

        }
    }
    //Calcolo e stampo la classifica dei giocatori
    calcolaClassificaTurno1();
}

//calcolo classifica del terzo turno
function calcolaClassificaTurno3()
{
    //Stampo la classifica della finale
    stampaGiocatoreTurno3();

    //Calcolo e stampo la classifica del turno2
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
        semaforo +=  'verde.png'
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
        '<td class="classifica-col3">' + giocatori[username].turni[1].puntiSpareggio + '</td>' +
        '<td class="classifica-col4"> <span class="game-win">' +  giocatori[username].turni[1].vinte + ' W</span> /'+
        '<span class="game-lost">' +  giocatori[username].turni[1].perse + ' L</span> /' +
        '<span class="game-draw">' +  giocatori[username].turni[1].patte + ' D</span>' +
        '</td>' +
        '</tr>'
    );
}

function stampaGiocatoreTurno2(username)
{
    var myTurno = 2;
    var semaforo = '';
    if (giocatori[username].turni[myTurno].qualificato == 1)
        semaforo +=  'verde.png'
    if (giocatori[username].turni[myTurno].qualificato == 0)
        semaforo +=  'rosso.png'

    //stampo riga    
    $("#turno2").append('<tr class="classifica-giocatori">' +
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
        '<td class="classifica-col3">' + giocatori[username].turni[myTurno].punti +'</td>' +
        '<td class="classifica-col3">' + giocatori[username].turni[myTurno].puntiSpareggio + ' (' + giocatori[username].turni[1].vinte +')</td>' +
        '<td class="classifica-col4"> <span class="game-win">' +  giocatori[username].turni[myTurno].vinte + ' W</span> /'+
        '<span class="game-lost">' +  giocatori[username].turni[myTurno].perse + ' L</span> /' +
        '<span class="game-draw">' +  giocatori[username].turni[myTurno].patte + ' D</span>' +
        '</td>' +
        '</tr>'
    );
}

function stampaGiocatoreTurno3()
{
     //assegno i punteggi delle finali
     var i = 0
     for (var i in finali) {
         //Preparo tabella per la stampa
         if (finali[i].white.username != '') {
             //Giocatore bianco
             username = finali[i].white.username;
             var semaforo = '';
             if (finali[i].white.result == 'win') semaforo =  'verde.png'
             else if (finali[i].white.result == 'lost') semaforo =  'rosso.png'
             else semaforo =  'giallo.png';   
              tabellaFinali[i] = '<td class="classifica-col1"><img class="classifica-avatar" src="img/' + semaforo + '"></td>' +  
                    '<td class="giocatori-col1SEP"></td>' + 
                     '<td class="classifica-col2-Finale">' +
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
                     '</td>';
             //Giocatore nero
             username = finali[i].black.username;
             var semaforo = '';
             if (finali[i].black.result == 'win') semaforo =  'verde.png'
             else if (finali[i].black.result == 'lost') semaforo =  'rosso.png'
             else semaforo =  'giallo.png';   
             tabellaFinali[1+i] = '<td class="classifica-col1"><img class="classifica-avatar" src="img/' + semaforo + '"></td>' +  
                   '<td class="giocatori-col1SEP"></td>' + 
                    '<td class="classifica-col2-Finale">' +
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
                    '</td>';
         }
     }        

     //Stampo la tabella
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[41] + '<td></td><td></td><td></td><td></td><td></td><td></td>  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[141] + tabellaFinali[21] + '<td></td><td></td><td></td>  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[42] +  tabellaFinali[121] + '<td></td><td></td><td></td>  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[142] + '<td></td><td></td><td></td>' +  tabellaFinali[11] + '  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[43] + '<td></td><td></td><td></td>' +  tabellaFinali[111] + '  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[143] + tabellaFinali[22] + '<td></td><td></td><td></td>  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[43]  +  tabellaFinali[122] + '<td></td><td></td><td></td>  </tr>');
     $("#finale").append('<tr class="classifica-giocatori">' +  tabellaFinali[143] + '<td></td><td></td><td></td><td></td><td></td><td></td>  </tr>');
}