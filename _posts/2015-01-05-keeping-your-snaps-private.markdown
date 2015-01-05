---
layout: post
title:  "Keeping Your Snaps Private"
categories: crypto
---

Don’t you find it dreadful when you recieve an email from a service you use,
asking for a ‘cautionary’ password change? Isn’t that so 1980?

I would appreciate an email along the lines of ‘We Were Hacked, You’re Safe.’

There’s no need for a precautionary password change, not in 2015. Not ever.

Changing the password now, won’t stop the attackers from gaining access to
private data. I hope my private data’s been encrypted, and probably not with
my ([hashed and salted](http://en.wikipedia.org/wiki/Scrypt "Please use Scrypt!")) password.

Today is 2015, we can do better. We must do better.

## Snapchat?

Securing snaps a la Snapchat poses an interesting problem:

  * there is a central server to which the contents of a snap should never be visible
  * there is a selection of users which have the exclusive privilege of viewing a snap
  * snaps work on mostly disconnected smart devices

I came up with a couple of solutions, but I’ll elaborate on one, since it’s
the simplest and most fitting for such an application.

## Public Keys, Private Keys

Firstly, every device for every user generates its own
[asymmetric](http://en.wikipedia.org/wiki/Public-key_cryptography) key pair
(public and private). The choice of an asymmetric algorithm is not important,
though I strongly suggest using something that is not RSA. I generally really
like [ECC](http://en.wikipedia.org/wiki/Elliptic_curve_cryptography)s, because
they’re small and more secure than RSA, but anything will do.
(Paranoid? Use [SIDH](http://en.wikipedia.org/wiki/Supersingular_Isogeny_Key_Exchange).)

Nobody but the device knows the private key. If compromised, the device may
generate a new pair. A good idea would be to implement perfect forward
secrecy, or at least a periodic regeneration of new pairs (every few snaps).

A central repository, which stores the snaps until they’ve been viewed by
every recipient, is notified of each public key.

## Symmetric Cipher

When a device takes a snap, it generates a random symmetric key with which it
encrypts the data of the snap. Don’t settle for anything less than
[AES](http://en.wikipedia.org/wiki/Advanced_Encryption_Standard). Pick a
large block size, and pick [initialization vectors](http://en.wikipedia.org/wiki/Initialization_vector) carefully.

For each recipient of the snap, the snapping device encrypts the symmetric key
and initialization vector with each of the recipients’ public keys. Then, it
sends out all of the encrypted keys and the encrypted snap to the server.

Upon receiving a notification that there are snaps awaiting on a recipient’s
device, the device obtains its encrypted key and snap from the server. It then
decrypts with its own private key the initialization vector and symmetric
key for the snap. With those obtained, it can now access the actual snap data,
and display it to the user.

## Issues

Although this may seem like a solid scheme at first, it generally does not
support sending snaps to large groups of people due to the large overhead that
the key exchange generates. There is also a computational overhead: encrypting
a lot of symmetric keys with asymmetric algorithms may be costly. A scheme,
possibly a P2P one, could be devised that solves issues of this sort.

‘My Story’ kinds of snaps are not ‘private’ and therefore outside of
consideration. I may expand on this issue in further blog posts.

