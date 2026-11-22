# Accounts (UC-11 to UC-20)

Actors, labels, and terms are in [README.md](README.md).

**UC-11 Open the sign-up form.** Actor: Visitor. Steps: Press "Account/Sign-in", then "create account".
Expected: The sign-in form shows username and password fields with "enter", "create account", and "cancel". The sign-up form shows the warning "Write down your username and password. Forget them and they are lost forever.", five Password rules each marked ✕, one of them a Riddle beginning "Answer:", and a disabled "enter" button.

**UC-12 Password rules check as you type.** Steps: Type a password holding a colour, a zodiac sign, the Riddle's answer, a digit, and a special character, one part at a time.
Expected: Each rule's mark turns to ✓ shortly after its part is typed. "enter" stays disabled until all five show ✓ and the username is filled.

**UC-13 Sign up.** Steps: Fill a new username and a password that meets every rule, then press "enter".
Expected: The form closes. The "Gallery" button appears. Pressing "Account/Sign-in" shows "Signed in as <username>."

**UC-14 Username taken.** Steps: Sign up with a username that already exists.
Expected: "That username is taken." shows and the form stays open.

**UC-15 Log in.** Pre: an account. Steps: Press "Account/Sign-in", fill the username and password, press "enter".
Expected: The form closes and the "Gallery" button appears.

**UC-16 Wrong password.** Steps: Log in with a wrong password, and again with a username that has no account.
Expected: "Wrong username or password." shows both times.

**UC-17 Log out.** Actor: User. Steps: Press "Account/Sign-in", then "log out".
Expected: The Root sky shows and the "Gallery" button is gone.

**UC-18 No pasting.** Steps: Copy some text and paste it into the username field and the password field, on both forms.
Expected: Nothing is pasted. The password shows as plain text while typed.

**UC-19 Stay signed in.** Actor: User. Steps: Reload the page.
Expected: The "Gallery" button still shows.

**UC-20 Too many attempts.** Steps: Submit a wrong login more than 10 times in a minute.
Expected: Later attempts show "Something went wrong. Try again."
