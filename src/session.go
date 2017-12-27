package main

import (
	"encoding/json"

	"github.com/Zamiell/hanabi-live/src/models"
	melody "gopkg.in/olahol/melody.v1"
)

type Session struct {
	*melody.Session
}

/*
	Functions to return session values
*/

func (s *Session) UserID() int {
	if v, exists := s.Get("userID"); !exists {
		log.Error("Failed to get \"userID\" from a session.")
		return -1
	} else {
		return v.(int)
	}
}

func (s *Session) Username() string {
	if v, exists := s.Get("username"); !exists {
		log.Error("Failed to get \"username\" from a session.")
		return "Unknown"
	} else {
		return v.(string)
	}
}

func (s *Session) CurrentGame() int {
	if v, exists := s.Get("currentGame"); !exists {
		log.Error("Failed to get \"currentGame\" from a session.")
		return -1
	} else {
		return v.(int)
	}
}

func (s *Session) Status() string {
	if v, exists := s.Get("status"); !exists {
		log.Error("Failed to get \"status\" from a session.")
		return "Unknown"
	} else {
		return v.(string)
	}
}

/*
	General purpose functions
*/

// Send a message to a client using the Golem-style protocol described above
func (s *Session) Emit(command string, d interface{}) {
	// Convert the data to JSON
	var ds string
	if dj, err := json.Marshal(d); err != nil {
		log.Error("Failed to marshal data when writing to a WebSocket session:", err)
		return
	} else {
		ds = string(dj)
	}

	// Send the message as bytes
	msg := command + " " + ds
	bytes := []byte(msg)
	if err := s.Write(bytes); err != nil {
		// This can routinely fail if the session is closed, so just return
		return
	}
}

// Sent to the client if either their command was unsuccessful or something else went wrong
// (client-side, this will cause a WebSocket disconnect and the program to completely restart)
func (s *Session) Error(message string) {
	// Specify a default error message
	if message == "" {
		message = "Something went wrong. Please contact an administrator."
	}

	type ErrorMessage struct {
		Message string `json:"message"`
	}
	s.Emit("error", &ErrorMessage{
		message,
	})
}

/*
	Notify functions
*/

// Notify a user about a new user that connected or a change in an existing user
func (s *Session) NotifyUser(u *Session) {
	type UserMessage struct {
		ID     int    `json:"int"`
		Name   string `json:"name"`
		Status string `json:"status"`
	}
	s.Emit("user", &UserMessage{
		ID:     u.UserID(),
		Name:   u.Username(),
		Status: u.Status(),
	})
}

// Notify a user about a new game or a change in an existing game
func (s *Session) NotifyTable(g *Game) {
	i := g.GetIndex(s.Username())
	joined := false
	if i != -1 {
		joined = true
	}

	numPlayers := len(g.Players)
	if g.SharedReplay {
		numPlayers = len(g.Spectators)
	}

	type TableMessage struct {
		ID           int    `json:"id"`
		Name         string `json:"name"`
		Joined       bool   `json:"joined"`
		NumPlayers   int    `json:"numPlayers"`
		Owned        bool   `json:"owned"`
		Running      bool   `json:"running"`
		Variant      int    `json:"variant"`
		Timed        bool   `json:"timed"`
		BaseTime     int    `json:"baseTime"`
		TimePerTurn  int    `json:"timePerTurn"`
		ReorderCards bool   `json:"reorderCards"`
		OurTurn      bool   `json:"ourTurn"`
		SharedReplay bool   `json:"sharedReplay"`
		Progress     int    `json:"gameProgress"`
	}
	s.Emit("table", &TableMessage{
		ID:           g.ID,
		Name:         g.Name,
		Joined:       joined,
		NumPlayers:   numPlayers,
		Owned:        s.UserID() == g.Owner,
		Running:      g.Running,
		Variant:      g.Options.Variant,
		Timed:        g.Options.Timed,
		BaseTime:     g.Options.TimeBase,
		TimePerTurn:  g.Options.TimePerTurn,
		ReorderCards: g.Options.ReorderCards,
		OurTurn:      joined && g.Running && g.PlayerIndex == i,
		SharedReplay: g.SharedReplay,
		Progress:     g.Progress,
	})
}

func (s *Session) NotifyGameStart(g *Game) {
	type GameStartMessage struct {
		Replay bool `json:"replay"`
	}
	replay := false
	if s.Status() == "Replay" || s.Status() == "Shared Replay" {
		replay = true
	}
	s.Emit("gameStart", &GameStartMessage{
		Replay: replay,
	})
}

// Notify a user about a game that ended
func (s *Session) NotifyTableGone(g *Game) {
	type TableGoneMessage struct {
		ID int `json:"id"`
	}
	s.Emit("tableGone", &TableGoneMessage{
		ID: g.ID,
	})
}

func (s *Session) NotifyChat(msg string, who string) {
	type ChatMessage struct {
		Msg string `json:"msg"`
		Who string `json:"who"`
	}
	s.Emit("chat", &ChatMessage{
		Msg: msg,
		Who: who,
	})
}

// Add a game to a user's game history
func (s *Session) NotifyGameHistory(h models.GameHistory) {
	type GameHistoryMessage struct {
		ID               int    `json:"id"`
		NumPlayers       int    `json:"numPlayers"`
		NumSimilar       int    `json:"numSimilar"`
		OtherPlayerNames string `json:"otherPlayerNames"`
		Score            int    `json:"score"`
		DatetimeFinished int64  `json:"datetime"`
		Variant          int    `json:"variant"`
	}
	s.Emit("gameHistory", &GameHistoryMessage{
		ID:               h.ID,
		NumPlayers:       h.NumPlayers,
		NumSimilar:       h.NumSimilar,
		OtherPlayerNames: h.OtherPlayerNames,
		Score:            h.Score,
		DatetimeFinished: h.DatetimeFinished,
		Variant:          h.Variant,
	})
}

// Once it is a player's turn, they recieve an "action" message which lists the allowed actions on this turn
func (s *Session) NotifyAction(g *Game) {
	type ActionMessage struct {
		CanClue          bool `json:"canClue"`
		CanDiscard       bool `json:"canDiscard"`
		CanBlindPlayDeck bool `json:"canBlindPlayDeck"`
	}
	s.Emit("action", &ActionMessage{
		CanClue:          g.Clues > 0,
		CanDiscard:       g.Clues < 8,
		CanBlindPlayDeck: g.DeckIndex == len(g.Deck)-1,
	})
}

func (s *Session) NotifySpectators(g *Game) {
	// Build an array with the names of all of the spectators
	var names []string
	for _, s := range g.Spectators {
		names = append(names, s.Name)
	}

	type SpectatorsMessage struct {
		Names []string `json:"names"`
	}
	s.Emit("spectators", &SpectatorsMessage{
		Names: names,
	})
}

func (s *Session) NotifyReplayLeader(g *Game) {
	// Get the username of the game owner
	// (the "Owner" field is used to store the leader of the shared replay)
	var name string
	for _, s := range g.Spectators {
		if s.ID == g.Owner {
			name = s.Name
			break
		}
	}

	// Send it
	type ReplayLeaderMessage struct {
		Name string `json:"name"`
	}
	s.Emit("replayLeader", &ReplayLeaderMessage{
		Name: name,
	})
}
