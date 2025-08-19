import React, { useState } from 'react'
import Controls from './components/Controls'
import Players from './components/Players'
import GameInfo from './components/GameInfo'
import CommunityCards from './components/CommunityCards'
import HoleCards from './components/HoleCards'
import Log from './components/Log'
import Showdown from './components/Showdown'
import EndRoundNote from './components/EndRoundNote'
import './index.css'

// hooks & services
import useLogs from './hooks/useLogs'
import usePokerSocket from './hooks/usePokerSocket'
import { joinGame, startHand, resetGame, playerAction, removeUnreadyPlayers } from './services/gameActions'

export default function App() {
  const [playerId, setPlayerId] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [gameState, setGameState] = useState({})
  const [privateState, setPrivateState] = useState({})
  const [validActions, setValidActions] = useState([])

  const { logs, addLog } = useLogs()

  // Bind socket events
  usePokerSocket({ addLog, setGameState, setPrivateState, setValidActions })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="text-center">
        <h1 className="text-3xl mt-4 font-bold tracking-wide">🃏 Poker Game 🃏</h1>
      </header>

      <section className="bg-poker-table/90 backdrop-blur rounded-xl2 p-4 shadow-table">
        <Controls
          onJoin={(name) => joinGame(name, setPlayerId, setPlayerName, addLog)}
          onStartHand={() => startHand(addLog)}
          onReset={() => resetGame(addLog)}
          playerName={playerName}
          onAction={(action, amount) => playerAction(action, amount, addLog)}
          validActions={validActions}
          gameState={gameState}
          onRemoveUnreadyPlayers={() => removeUnreadyPlayers(addLog)}
        />
      </section>

      <GameInfo gameState={gameState} />
      
      <Showdown showdown={gameState.showdown} />


      <section className="bg-poker-table/90 backdrop-blur rounded-xl2 px-5 py-8 shadow-table">
        <Players
          player_name={playerName}
          players={gameState.players || []}
          currentPlayerSeat={gameState.currentPlayerSeat}
          dealerSeat={gameState.dealerSeat}
          phase={gameState.phase}
        />
         <CommunityCards community={gameState.community || []} />
        {gameState.phase === 'waiting' && gameState.community && <EndRoundNote />}
      </section>

      <HoleCards holeCards={privateState.holeCards} />



      <Log logs={logs} />
    </div>
  )
}
