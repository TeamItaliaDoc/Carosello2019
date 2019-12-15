
//  Gestione giocatori
//
//         la funziona di stampa classifica deve essere riportata nel js che lo lancia

var getEloRun = false;
var calcolaClassificaGiocatoriRun = false;

var giocatori = [];

function getAvatar() {
    //Cerco avatar
    for (var username in giocatori) {
        getAvatarUrl('https://api.chess.com/pub/player/' + username);
    }
}     

function getAvatarUrl(url)
{
    //Eseguo funzione per ricercare un avatar
    $.getJSON(url,function(dataAvatar){
        if (dataAvatar.avatar) {
            giocatori[dataAvatar.username].avatar = dataAvatar.avatar;
        } else {
            giocatori[dataAvatar.username].avatar = "https://betacssjs.chesscomfiles.com/bundles/web/images/user-image.152ee336.svg";
        }
        giocatori[dataAvatar.username].url = dataAvatar.url;
        giocatori[dataAvatar.username].displayName = dataAvatar.url.substr(29, dataAvatar.url.length-29);

        //Se non ho caricato tuti gli avatar esengo ancora la funzione
        for (var username in giocatori) {
            if (! giocatori[username].avatar) {
                return;
            }
        }
  
        //Finito calcolo. Scrivo i risultati 
        //   Controllo se è già partita la fase di scrittura
        //      se arrivano contemporaneamente più caricamenti potrebbe succedere
        if (! getEloRun)
        {
            getEloRun = true;
            getElo();
        }
    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        getAvatarUrl(this.url);    
        //Per evitare problemi se il giocatore è non esiste,
        //  se va in errore carico l'avatar di default
        //Tolto se il giocatore va in errore bisogna correggere anche stat
        //var username = this.url.substr(33, this.url.length - 32);
        //giocatori[username.toLowerCase()].avatar = "https://betacssjs.chesscomfiles.com/bundles/web/images/user-image.152ee336.svg";

    });

}

function getElo()
{
    //Cerco l'avatar per tutti i giocatori
    for (var username in giocatori) {
        //Cerco avatar
        getEloUrl('https://api.chess.com/pub/player/' + username + '/stats');
    }    
}

function getEloUrl(url)
{
    //Eseguo funzione per ricercare un avatar
    $.getJSON(url,function(data){
        var username = ''
        username = this.url.substr(33, this.url.length-39);
        if (data.chess_daily)
            giocatori[username].elo = data.chess_daily.last.rating;
        else
            giocatori[username].elo = 1200;    
            
        //Se non ho caricato tuti gli elo  esengo ancora la funzione
        for (var username in giocatori) {
            if (! giocatori[username].elo) {
                return;
            }
        }

        if (calcolaClassificaGiocatoriRun)
            return;
            calcolaClassificaGiocatoriRun = true;

        //Calcolo clasifica
        //Calcolo e stampo prima la classifica del carosello
        //calcolaClassificaGiocatori();
        calcolaClassificaTurno3();

    }).error(function(jqXhr, textStatus, error) {
        //è andato in errore ricarico i dati
        getEloUrl(this.url);    
    });

}

function creaGiocatore(apiUsername) {
    //Uso apiUsername perchè così posso inviare sia username che displayname
    var username = apiUsername.toLowerCase()
    giocatori[username] = {};
    giocatori[username].username = username;
    giocatori[username].url = '';
    giocatori[username].displayName = '';
    //lo assegno quando lo trovo giocatori[username].avatar = '';
    //lo assegno quando lo trovo giocatori[username].elo = 0;
    giocatori[username].punti = 0;
    giocatori[username].puntiSpareggio = 0;
    giocatori[username].posizione = 0;
    giocatori[username].vinte = 0;
    giocatori[username].perse = 0;
    giocatori[username].patte = 0;
    giocatori[username].userVinte = [];
    giocatori[username].userPatte = [];
    //Campi specifici del torneo
    giocatori[username].turni = [];
    for (var i=1; i < 4; i++) {
        giocatori[username].turni[i] = {};
        giocatori[username].turni[i].daStampare = true;
        giocatori[username].turni[i].punti = 0;
        giocatori[username].turni[i].match = 0;
        giocatori[username].turni[i].girone = 0;
        giocatori[username].turni[i].puntiSpareggio = 0;
        giocatori[username].turni[i].posizioneGruppo = 0;
        giocatori[username].turni[i].qualificato = 0;
        giocatori[username].turni[i].vinte = 0;
        giocatori[username].turni[i].perse = 0;
        giocatori[username].turni[i].patte = 0;
        giocatori[username].turni[i].userVinte = [];
        giocatori[username].turni[i].userPatte = [];
    }
    //Solo turno 2
    giocatori[username].turni[2].puntiSpareggioVittorie = 0;       
}

function setPunti(iTurno, username, risultato, avversario)
{
    //gli username devono essere sempre in minuscolo
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
        //Per classifica carosello    
        giocatori[username].turni[iTurno].punti ++;
        giocatori[username].turni[iTurno].vinte ++;
        giocatori[username].turni[iTurno].userVinte.push(avversario);
    } else {
        if ((risultato == 'agreed') || (risultato == 'repetition')  || (risultato == 'timevsinsufficient') || 
        (risultato == '50move') || (risultato == 'insufficient') || (risultato == 'stalemate')  ){
                giocatori[username].punti += 0.5;
                giocatori[username].patte ++;
                giocatori[username].userPatte.push(avversario);
                //Per classifica carosello    
                giocatori[username].turni[iTurno].punti += 0.5;
                giocatori[username].turni[iTurno].patte ++;
                giocatori[username].turni[iTurno].userPatte.push(avversario);
            } else {
                giocatori[username].perse ++;
                //Per classifica carosello    
                giocatori[username].turni[iTurno].perse ++;
            }
    }
}

function calcolaClassificaGiocatori()
{
    //calcolo punti spareggio
    for (var username in giocatori)
    {
        for (var i in giocatori[username].userVinte)
            giocatori[username].puntiSpareggio += giocatori[giocatori[username].userVinte[i]].punti;
        for (var ii in giocatori[username].userPatte)
            giocatori[username].puntiSpareggio += giocatori[giocatori[username].userPatte[ii]].punti / 2;

    }

    //Imposto posizione e salvo
    var username = '';
    var max = 0;
    var maxSpareggio = 0;
    var posizione = 0;
    var nPareggi = 0;
    var oldMax = 0;
    var oldSpareggio = 0;
    while (max > -1)
    {
        max = -1;
        maxSpareggio = -1;
        for (var i in giocatori)
        {
            if ((giocatori[i].posizione == 0) && (giocatori[i].punti > max || (giocatori[i].punti == max) && giocatori[i].puntiSpareggio > maxSpareggio)) {
                username = i;
                max = giocatori[i].punti;
                maxSpareggio = giocatori[i].puntiSpareggio;
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
           giocatori[username].posizione = posizione;
           //Stampo il giocatore
           stampaGiocatore(username);
        }
    }
   
 }
 
function stampaGiocatore(username)
{
    //stampo riga    
    $("#giocatori").append('<tr class="classifica-giocatori">' +
        '<td class="classifica-col1">' + giocatori[username].posizione + '</td>' +  
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
        '<td class="classifica-col3">' + giocatori[username].punti +'</td>' +
        '<td class="classifica-col3">' + giocatori[username].puntiSpareggio +'</td>' +
        '<td class="classifica-col4"> <span class="game-win">' +  giocatori[username].vinte + ' W</span> /'+
        '<span class="game-lost">' +  giocatori[username].perse + ' L</span> /' +
        '<span class="game-draw">' +  giocatori[username].patte + ' D</span>' +
        '</td>' +
        '</tr>'
    );
}
