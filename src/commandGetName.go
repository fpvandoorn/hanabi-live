/*
	Sent when the user makes a new game
	"data" is empty
*/

package main

import (
	"strings"
)

const (
	numWords = 3
)

// Generate a random table name
func commandGetName(s *Session, d *CommandData) {
	words := make([]string, 0)
	for len(words) < 3 {
		i := getRandom(0, len(wordList)-1)
		word := wordList[i]

		// We want 3 unique words
		if !stringInSlice(word, words) {
			words = append(words, word)
		}
	}

	name := strings.Join(words, " ")

	type NameMessage struct {
		Name string `json:"name"`
	}
	s.Emit("name", &NameMessage{
		Name: name,
	})
}
