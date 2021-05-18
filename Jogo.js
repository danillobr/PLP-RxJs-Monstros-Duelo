const CartaMagica = require("./cartas/CartaMagica.js");
const CartaMonstro = require("./cartas/CartaMonstro.js");
const { Subject, from } = require('rxjs');
const { filter, take, distinct, skipWhile, merge } = require('rxjs/operators');
const readline = require('readline-sync');

module.exports = class Jogo {
    constructor() {
        this.campoMagico = new Array();
        this.campoMonstro = new Array();
        this.roundAtual = 0;
        this.baralho = new Array();
        this.monstrosJogadosPorRound = 0;
    }

    mostrarCampoMonstro() {
        console.log("Campo dos Monstros: ", this.campoMonstro);
    }

    mostrarCampoMagico() {
        console.log("Campo das cartas Magicas: ", this.campoMagico);
    }

    mostrarCartasBaralho() {
        console.log("Baralho: ", this.baralho);
    }

    atualizarBaralho(nomeCarta) {
        const baralhoUpdate = new Subject();
        baralhoUpdate
            .pipe(
                skipWhile(carta => carta.nome != nomeCarta),
                take(1)
            )
            .subscribe(
                carta => this.baralho.splice(this.baralho.indexOf(carta), 1)
            );
        var atualizando = (carta) => {
            baralhoUpdate.next(carta);
        }
        this.baralho.forEach(carta => atualizando(carta));
    }

    proximoRound() {
        this.monstrosJogadosPorRound = 0;
        this.roundAtual++;
        var atualizaDuracaoCartaNoCampo = (carta) => {
            carta.duracao -= 1;
        }
        this.campoMagico.forEach(carta => atualizaDuracaoCartaNoCampo(carta));

        const campoMagicoUpdate = new Subject();
        campoMagicoUpdate
            .pipe(
                skipWhile(carta => carta.duracao != 0)
            )
            .subscribe(
                carta => this.campoMagico.splice(this.campoMagico.indexOf(carta), 1),
            );
        var atualizando = (carta) => {
            campoMagicoUpdate.next(carta);
        }
        this.campoMagico.forEach(carta => atualizando(carta));
    }

    jogarCartaMagica(nomeCarta) {
        if (this.campoMagico.length < 5) {
            const pegandoDoBaralho = (carta$) => carta$.pipe(
                filter(carta => (carta.tipo === "Magica" && carta.nome === nomeCarta)),
                distinct(),
                take(1),
            );
            const sourceCartas$ = from(this.baralho);
            const cartaEscolhida$ = pegandoDoBaralho(sourceCartas$);
            cartaEscolhida$.subscribe(
                carta => this.campoMagico.push(carta)
            );
            this.atualizarBaralho(nomeCarta);
        } else {
            console.log('Campo das Cartas Mágicas já está cheio!');
        }
    }

    jogarCartaMonstro(nomeCarta) {
        if (this.campoMonstro.length < 5 && this.monstrosJogadosPorRound < 2) {
            const pegandoDoBaralho = (carta$) => carta$.pipe(
                filter(carta => (carta.tipo === "Monstro" && carta.nome === nomeCarta)),
                distinct(),
                take(1),
            );
            const sourceCartas$ = from(this.baralho);
            const cartaEscolhida$ = pegandoDoBaralho(sourceCartas$);
            cartaEscolhida$.subscribe(
                carta => this.campoMonstro.push(carta)
            );
            this.atualizarBaralho(nomeCarta);
            this.monstrosJogadosPorRound++;
        } else {
            console.log('Campo de Monstro já está cheio ou você alcançou o limete de jogadas por round!');
        }
    }

    sacrificarMostro(nomeCarta) {
        if (this.campoMonstro.length > 0) {
            const campoMonstroUpdate = new Subject();
            campoMonstroUpdate
                .pipe(
                    filter(carta => carta.nome === nomeCarta && carta.tipo === "Monstro"),
                    take(1)
                )
                .subscribe(
                    carta => this.campoMonstro.splice(this.campoMonstro.indexOf(carta), 1)
                );
            var sacrificando = (carta) => {
                campoMonstroUpdate.next(carta);
            }
            this.campoMonstro.forEach(carta => sacrificando(carta));
        }
    }

    menu() {
        var entrada = readline.question("Round atual: " + this.roundAtual + "\n"
            + "Escolha uma opcao:\n"
            + "1 - Ver Baralho\n"
            + "2 - Jogar uma Carta Magica\n"
            + "3 - Ver campo das Cartas Magicas\n"
            + "4 - Jogar uma Carta Monstro\n"
            + "5 - Sacrificar uma Carta Monstro\n"
            + "6 - Ver campo das Cartas Monstros\n"
            + "7 - Passar para o Proximo Round\n");
        console.clear();

        if (entrada == 1) {
            this.mostrarCartasBaralho();
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 2) {
            entrada = readline.question("Digite o nome da Carta\n");
            this.jogarCartaMagica(entrada);
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 3) {
            this.mostrarCampoMagico();
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 4) {
            entrada = readline.question("Digite o nome da Carta\n");
            this.jogarCartaMonstro(entrada);
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 5) {
            entrada = readline.question("Digite o nome da Carta que deseja sacrificar\n");
            this.sacrificarMostro(entrada);
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 6) {
            this.mostrarCampoMonstro();
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        } else if (entrada == 7) {
            this.proximoRound();
            entrada = readline.question("Pressione Enter para voltar ao menu...");
            console.clear()
            this.menu();
        }
    }

    iniciar() {
        var magoNegro = new CartaMonstro(0, "Mago Negro", 7, 2500, 2100);
        var magaNegra = new CartaMonstro(1, "Maga Negra", 6, 2000, 1700);
        var dragaoNegro = new CartaMonstro(2, "Dragao Negro", 7, 2400, 2000);
        var grandeEscudoGardna = new CartaMonstro(3, "Grande Escudo Gardna", 4, 100, 2600);
        var kuriboh = new CartaMonstro(4, "Kuriboh", 1, 300, 200);
        var esferaKuriboh = new CartaMonstro(5, "Esfera Kuriboh", 1, 300, 200);
        var magoDoTempo = new CartaMonstro(6, "Mago do Tempo", 2, 500, 400);
        var cabecaDoExodia = new CartaMonstro(7, "Cabeca do Exodia", 3, 1000, 1000);
        var bracoDireitoDoExodia = new CartaMonstro(8, "Braco Direito do Exodia", 1, 200, 300);
        var bracoEsquerdoDoExodia = new CartaMonstro(9, "Braco Esquerdo do Exodia", 1, 200, 300);
        var pernaDireitaDoExodia = new CartaMonstro(10, "Perna Direita do Exodia", 1, 200, 300);
        var penaEsquerdaDoExodia = new CartaMonstro(11, "Perna Esquerda do Exodia", 1, 200, 300);
        var magoNegro2 = new CartaMonstro(12, "Mago Negro", 7, 2500, 2100);
        var dragaoNegro2 = new CartaMonstro(13, "Dragao Negro", 7, 2400, 2000);
        var dragaoNegro3 = new CartaMonstro(14, "Dragao Negro", 7, 2400, 2000);
        var kuriboh2 = new CartaMonstro(15, "Kuriboh", 1, 300, 200);

        var forcaEspelho = new CartaMagica(16, "Forca Espelho", false, 1);
        var espadasDaLuz = new CartaMagica(17, "Espadas da Luz Reveladora", false, 3);
        var fusao = new CartaMagica(18, "Fusao", true, 0);
        var mostroRenasce = new CartaMagica(19, "Monstro que Renasce", false, 1);
        var circuloMagicoNegro = new CartaMagica(20, "Circulo Magico Negro", true, 0);
        var lacreOrichalcos = new CartaMagica(21, "Lacre de Orichalcos", true, 0);
        var espadasDaLuz2 = new CartaMagica(22, "Espadas da Luz Reveladora", false, 3);
        var forcaEspelho2 = new CartaMagica(16, "Forca Espelho", false, 1);

        this.baralho = [
            magoNegro,
            magaNegra,
            dragaoNegro,
            grandeEscudoGardna,
            kuriboh,
            esferaKuriboh,
            magoDoTempo,
            cabecaDoExodia,
            bracoDireitoDoExodia,
            bracoEsquerdoDoExodia,
            pernaDireitaDoExodia,
            penaEsquerdaDoExodia,
            magoNegro2,
            dragaoNegro2,
            dragaoNegro3,
            kuriboh2,
            forcaEspelho,
            espadasDaLuz,
            fusao,
            mostroRenasce,
            circuloMagicoNegro,
            lacreOrichalcos,
            espadasDaLuz2,
            forcaEspelho2
        ]; 
        this.menu();
    }
}

