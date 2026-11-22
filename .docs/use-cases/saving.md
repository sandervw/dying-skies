# Saving, the Gallery, and destroying (UC-21 to UC-28)

Actors, labels, and terms are in [README.md](README.md).

**UC-21 Save a Sky.** Actor: User. Steps: Fall into a Star, then press "Save this sky".
Expected: "Save this sky" is replaced by "Destroy this sky". Within 30 seconds the footer's "saved" number is one higher.

**UC-22 Where saving is offered.** Actor: User. Steps: Open the Root sky. Then fall into a Star, reload the page, and look again.
Expected: Neither view shows "Save this sky". The button shows only on a Sky reached by clicking a Star during this visit.

**UC-23 No saving signed out.** Actor: Visitor. Steps: Fall into a Star.
Expected: No "Save this sky", "Destroy this sky", or "Gallery" button shows.

**UC-24 Open the Gallery.** Actor: User with Saved Skies. Steps: Press "Gallery".
Expected: The address is `/gallery`. One tile shows per Saved Sky, newest first, each with a Constellation and one Star. The button now reads "Back".

**UC-25 Open a Sky from the Gallery.** Steps: Click the Star in a tile, then click a tile's empty area.
Expected: The Star click opens that Sky at `/sky/<token>` with "Destroy this sky" showing. The empty-area click does nothing.

**UC-26 Empty and signed-out Gallery.** Steps: As a User with no Saved Skies, press "Gallery". Then log out and open `/gallery`.
Expected: The User sees "No saved skies yet." The Visitor lands on the Root sky.

**UC-27 Destroy a Sky.** Actor: User on a Saved Sky. Steps: Press "Destroy this sky", then "cancel". Press it again, then "destroy".
Expected: The prompt reads "Destroy this sky forever?". After "cancel" the Sky stays Saved. After "destroy" the Root sky shows, the Sky is gone from the Gallery, and within 30 seconds the footer's "destroyed" number is one higher.

**UC-28 Destroyed stays destroyed.** Pre: UC-27, same visit. Steps: Press the browser's back button to the Destroyed Sky and press "Save this sky".
Expected: The Sky does not appear in the Gallery.
