import React, { Component } from 'react'
import shuffle from 'lodash.shuffle'

import './App.css'
import HighScoreInput from "./HighScoreInput"
import Card from './Card'
import GuessCount from './GuessCount'
import HallOfFame, { FAKE_HOF } from './HallOfFame'

const SIDE = 6
const SYMBOLS = '😀🎉💖🎩🐶🐱🦄🐬🌍🌛🌞💫🍎🍌🍓🍐🍟🍿'
const VISUAL_PAUSE_MSECS = 750
// Le but de cette application est d'arriver à trouver 15 paires qui se ressemblent
// Les 15 paires doivent être trouvées par le joueur en cliquant sur les cartes , 
// Une fois qu'il a cliqué 2 fois, si les 2 cartes sont les mêmes, elles restent affichées
// Si elles sont différentes, elles disparaissent
// lorsque les 15 paires sont trouvées un composant HallOfFame apparaît
class App extends Component {
    state = {
        cards: this.generateCards(),
        currentPair: [],
        guesses: 0,
        hallOfFame: null,
        matchedCardIndices: [],
      }

 // Fait un tableau d'icones à partir de symbols
 // est appelé dès l'init      
  generateCards() {
    const result = []
    const size = SIDE * SIDE
    const candidates = shuffle(SYMBOLS)
    while (result.length < size) {
      const card = candidates.pop()
      result.push(card, card)
    }
    return shuffle(result)
  }

  // Affiche le tableau d'honneur une fois que toutes les paires sont trouvées
  // et que donc la partie est terminée
  displayHallOfFame = (hallOfFame) => {
      this.setState({ hallOfFame })
    }
// défini si ma carte est visible ou pas
  getFeedbackForCard(index) {
    const { currentPair, matchedCardIndices } = this.state
    const indexMatched = matchedCardIndices.includes(index)

    if (currentPair.length < 2) {
      return indexMatched || index === currentPair[0] ? 'visible' : 'hidden'
    }

    if (currentPair.includes(index)) {
      return indexMatched ? 'justMatched' : 'justMismatched'
    }

    return indexMatched ? 'visible' : 'hidden'
  }

  // Est appelée dès qu'on clique, sert à gérer le tableau currentPair[]
  // le tableau currentPair sert à gérer les paires que l'utilisateur est en train de créer
  handleCardClick = index => {
    const { currentPair } = this.state

    if (currentPair.length === 2) {
      return
    }

    if (currentPair.length === 0) {
      // si toute les cartes sont avec un ? c'est qu'aucune pair n'a commencé à êtrer créée
      // donc le tableau currentpair qui gère les paires de cartes, est vide
      // puisque le tableau est vide on met à jour le currentPair ds le state avec
      // l'index de la carte qui vient d'etre cliquée
      // et donc maintenant le currentPair du State n'est plus vide et n'est plus égal à 0, donc on ne repassera 
      // plus ici 
      this.setState({ currentPair: [index] })
      return
    }

    this.handleNewPairClosedBy(index)
  }

  // Détermine si on a trouvé une bonne paire en analysant currentPair et index
  handleNewPairClosedBy(index) {
    const { cards, currentPair, guesses, matchedCardIndices } = this.state

    const newPair = [currentPair[0], index]
    const newGuesses = guesses + 1
    const matched = cards[newPair[0]] === cards[newPair[1]]
    this.setState({ currentPair: newPair, guesses: newGuesses })
    if (matched) {
      this.setState({ matchedCardIndices: [...matchedCardIndices, ...newPair] })
    }
    setTimeout(() => this.setState({ currentPair: [] }), VISUAL_PAUSE_MSECS)
  }

  // Est executé à l'init ET à chaque fois que setState est appelé
render() {
  const { cards, guesses, hallOfFame, matchedCardIndices } = this.state
  const won = matchedCardIndices.length === 2 
  // à chaque fois que map créer un Card on execute la méthode getFeedBackForCard,
  // et on sait d'ailleurs qu'à chaque fois que la méthode render est appelée les Cards seront toutes recréées
  // DONC a chaque fois la méthode getFeedbackforcard sera appelée
    return (
      <div className="memory">
        <GuessCount guesses={guesses} />
        
        {cards.map((card, index) => (
          <Card
            card={card}
            feedback={this.getFeedbackForCard(index)}
            index={index}
            key={index}
            onClick={this.handleCardClick}
          />
        ))}
   
          {  won &&
            (hallOfFame ? (
              <HallOfFame entries={hallOfFame} />
            ) : (
              <HighScoreInput guesses={guesses} onStored={this.displayHallOfFame} />
            ))
          }
      </div>
    )
  }
}

export default App
