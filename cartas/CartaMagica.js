const Carta = require("./Carta.js");
module.exports = class CartaMagica extends Carta {
    constructor(id, nome, permanente, duracao) {
        super(id, nome);
        this.tipo = 'Magica';
        this.permanente = permanente;
        this.duracao = duracao;
    }
}