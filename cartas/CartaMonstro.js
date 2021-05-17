const Carta = require("./Carta.js");
module.exports = class CartaMonstro extends Carta {
    constructor(id, nome, estrelas, ataque, defesa) {
        super(id, nome);
        this.tipo = 'Monstro';
        this.estrelas = estrelas;
        this.ataque = ataque;
        this.defesa = defesa;
    }
}