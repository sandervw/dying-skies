# Skies (UC-01 to UC-10)

Actors, labels, and terms are in [README.md](README.md).

**UC-01 Open the Root sky.** Actor: Visitor. Steps: Open `/`.
Expected: A black field with white dots, a Constellation, and Stars falling across it. The title "DYING SKIES" shows with a three-part Readout under it. The footer reads "So far, man has saved N skies, destroyed N skies, and allowed N skies to die." with a number for each N.

**UC-02 Fall into a Star.** Steps: Move the pointer over a falling Star, then click it.
Expected: The pointer becomes a hand over the Star. After the click the address is `/sky/<token>`, the static art and the Readout change, and new Stars fall.

**UC-03 Same Seed, same Sky.** Pre: a Sky at `/sky/<token>`. Steps: Screenshot it, reload, and screenshot again.
Expected: The dots, the Constellation, and the Readout match. The falling Stars differ.

**UC-04 Share a Sky.** Steps: Copy the address of a Sky and open it in a fresh browser.
Expected: The same static art and Readout show as in the first browser.

**UC-05 Bad address.** Steps: Open `/sky/not-a-seed`, then `/nowhere`.
Expected: Both show the Root sky's static art.

**UC-06 Go back.** Pre: fell from one Sky into another. Steps: Press the browser's back button.
Expected: The earlier Sky's static art and address return.

**UC-07 Immersive mode.** Steps: Press "immersive-mode", then press it again.
Expected: The title, the Readout, and the footer hide and the controls dim. The second press brings them back.

**UC-08 Music.** Steps: Open a Sky, press "Unmute music", then press "Mute music".
Expected: The Sky is silent on arrival and the button reads "Unmute music". After the first press music plays and the button reads "Mute music". After the second press the music stops.

**UC-09 Analytics link.** Steps: Press "Analytics".
Expected: The browser leaves for `https://dyingskies.com/analytics/`.

**UC-10 Counter stays live.** Steps: Leave a Sky open for 30 seconds while Stars fall off the screen.
Expected: The footer's "die" number rises without a reload.
