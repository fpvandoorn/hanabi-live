/*
    Speedrun click functions for the HanabiCard object
*/

// Imports
import * as constants from '../../constants';
import globals from './globals';
import * as notes from './notes';
import * as ui from './ui';

export default function HanabiCardClickSpeedrun(event) {
    // Speedrunning overrides the normal card clicking behavior
    // (but don't use the speedrunning behavior if we are in a
    // solo replay / shared replay / spectating / clicking on the stack base)
    if (
        (!globals.speedrun && !globals.lobby.settings.speedrunMode)
        || globals.replay
        || globals.spectating
        || this.rank === constants.STACK_BASE_RANK
    ) {
        return;
    }

    if (
        // Unlike the "click()" function, we do not want to disable all clicks if the card is
        // tweening because we want to be able to click on cards as they are sliding down
        // However, we do not want to allow clicking on the first card in the hand
        // (as it is sliding in from the deck)
        (this.tweening && this.parent.index === this.parent.parent.children.length - 1)
        || this.isPlayed // Do nothing if we accidentally clicked on a played card
        || this.isDiscarded // Do nothing if we accidentally clicked on a discarded card
    ) {
        return;
    }

    if (event.evt.which === 1) { // Left-click
        clickLeft(this, event.evt);
    } else if (event.evt.which === 3) { // Right-click
        clickRight(this, event.evt);
    }
}

const clickLeft = (card, event) => {
    // Left-clicking on cards in our own hand is a play action
    if (
        card.holder === globals.playerUs
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        ui.endTurn({
            type: 'action',
            data: {
                type: constants.ACT.PLAY,
                target: card.order,
            },
        });
        return;
    }

    // Left-clicking on cards in other people's hands is a color clue action
    // (but if we are holding Ctrl, then we are using Empathy)
    if (
        card.holder !== globals.playerUs
        && globals.clues !== 0
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        globals.preCluedCard = card.order;

        // A card may be cluable by more than one color,
        // so we need to figure out which color to use
        const clueButton = globals.elements.clueTypeButtonGroup.getPressed();
        const cardColors = card.suit.clueColors;
        let color;
        if (
            // If a clue type button is selected
            clueButton
            // If a color clue type button is selected
            && clueButton.clue.type === constants.CLUE_TYPE.COLOR
            // If the selected color clue is actually one of the possibilies for the card
            && cardColors.findIndex((cardColor) => cardColor === clueButton.clue.value) !== -1
        ) {
            // Use the color of the currently selected button
            color = clueButton.clue.value;
        } else {
            // Otherwise, just use the first possible color
            // e.g. for rainbow cards, use blue
            [color] = cardColors;
        }

        const value = globals.variant.clueColors.findIndex(
            (variantColor) => variantColor === color,
        );
        ui.endTurn({
            type: 'action',
            data: {
                type: constants.ACT.CLUE,
                target: card.holder,
                clue: {
                    type: constants.CLUE_TYPE.COLOR,
                    value,
                },
            },
        });
    }
};

const clickRight = (card, event) => {
    // Right-clicking on cards in our own hand is a discard action
    if (
        card.holder === globals.playerUs
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        // Prevent discarding while at the maximum amount of clues
        if (globals.clues === constants.MAX_CLUE_NUM) {
            return;
        }
        ui.endTurn({
            type: 'action',
            data: {
                type: constants.ACT.DISCARD,
                target: card.order,
            },
        });
        return;
    }

    // Right-clicking on cards in other people's hands is a rank clue action
    if (
        card.holder !== globals.playerUs
        && globals.clues !== 0
        && !event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        globals.preCluedCard = card.order;
        ui.endTurn({
            type: 'action',
            data: {
                type: constants.ACT.CLUE,
                target: card.holder,
                clue: {
                    type: constants.CLUE_TYPE.RANK,
                    value: card.rank,
                },
            },
        });
        return;
    }

    // Ctrl + right-click is the normal note popup
    if (
        event.ctrlKey
        && !event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        notes.openEditTooltip(card);
        return;
    }

    // Shift + right-click is a "f" note
    // (this is a common abbreviation for "this card is Finessed")
    if (
        !event.ctrlKey
        && event.shiftKey
        && !event.altKey
        && !event.metaKey
    ) {
        card.setNote('f');
        return;
    }

    // Alt + right-click is a "cm" note
    // (this is a common abbreviation for "this card is chop moved")
    if (
        !event.ctrlKey
        && !event.shiftKey
        && event.altKey
        && !event.metaKey
    ) {
        card.setNote('cm');
    }

    // Alt + shift + right-click is a "p" note
    // (this is a common abbreviation for "this card was told to play")
    if (
        !event.ctrlKey
        && event.shiftKey
        && event.altKey
        && !event.metaKey
    ) {
        card.setNote('p');
    }
};
