---
layout: post
title:  "Confident Programming"
date:   2015-08-30 14:02
categories: art-of-programming
excerpt: A confident programmer is the one that takes a strong and persistent stance against time rot.
---

Recently I've been thinking a lot about what I call the Art of Programming.
I want to extract the essence of what it means to be a professional programmer,
and how to become even better.

But here, I just want to present the idea of Confident Programming. It is a
recurring idea which stems from Extreme Programming and Agile practices, but
also from <abbr title="Test Driven Design">TDD</abbr> and Defensive
Programming.

## The Journey

The completion of a few freelance projects left me very unhappy with their
outcome. It's a bad place to be: when you're not happy with what you've
spent a lot of time on. There were issues both in the organization of those
projects and in their technological setup.

After many months spent at reflection, I realized that my main stance then was
to get code out the door. I had this vision of where I wanted to go in the
project, but the broken windows kept piling up. Nobody wants to live in a house
with broken windows, half of a door and a barely upright roof.

In the Balkans, there's this common enemy of the Slavs: [promaya](https://translate.google.com/#mk/en/%D0%BF%D1%80%D0%BE%D0%BC%D0%B0%D1%98%D0%B0).
It embodies the health damaging properties of a (cold) current of air constantly
blowing throughout a house. I will refer to inconsiderate and hasty programming
practices as promaya coding.

## Removing Promaya

The solution sure sounds simple: fix all the windows; close off the leaks in
the roof; install a sturdy door. But, it's not. When you install the sturdy
door, for example, now the walls are a weak point. Whatever you choose to fix
in this "broken" system, there will always be other things to fix. The system
is only as strong as its weakest link.

The persistent lack of maintenance, therefore, is the source of promaya.

But I get it. There are greater problems than the small crack in the window,
the squeaky door, the chipping wall paint. We know that the wall is not pretty,
but we get away with it. Solving the larger problems only leaves you with a
greater dissatisfaction with the current state of things. Small, unimportant
problems keep coming up but it's never time for them. There will always be
something more important, more urgent.

Suddenly, it's a house you do not want to live in.

The solution to promaya coding is simple: a constant and powerful stance against
time rot.

When a window breaks, you fix it immediately. When the wall paint starts to
chip, you repaint the house. When the door does not protect you from burglars,
you install a better one then and there. There's no time for later. There is
only now.

## Avoidance

Avoiding promaya is not simple, but it is manageable. I see three spots from
which to attack the problem: planning, design and implementation.

### Planning

Plan for constant maintenance. A.S.A.P. and "I need it yesterday" are as serious
problems as promaya itself. They show a lack of care or understanding. Run away
from A.S.A.P.

So long as the plan includes vigorous testing and constant refactoring, promaya
can be easily avoided.

Rush is the enemy of good code.

### Design

System design is a large topic, but I want to emphasize a few key points that
really work against promaya.

- Decoupled and testable code is promaya-resistant by design.
- Aim for as large test coverage as possible with the fewest tests as possible.
- Emphasize the single-responsibility requirements for functional units.

### Implementation

Test at the boundaries; and test the code paths themselves. Get in a strong
relationship with immutability, and ignore people who still think that
copying objects is a performance bottleneck.

Get out of the mindset of optimizing instructions and memory, and instead focus
on optimizing design. [Compilers](http://llvm.org/) and
[OSs](https://en.wikipedia.org/wiki/Virtual_memory) are better at the former,
anyhow.

#### Contract Programming

Contract programming is a great technique to catch bugs early. Even earlier than
in tests! Assertions within code can often times be disabled by the compiler,
and even if they aren't their performance contribution is in almost any case,
negligible.

What I also really like about contract programming is the implicit documentation
it gives to the code. For example, asserting that an argument is sorted before
the actual computation on it begins, it implicitly conveys the information that
the argument must be sorted. (Duh!) Words are the enemy, code is not.

And finally, contracts in code is the documentation you never write.

## Conclusion

When I finish an immediate relationship with a project, I want to be confident
that what I've created is good and that it has some value to someone. I want to
be confident that when a fellow engineer tries to use the software, or maintain
it that it will not waste his time and energy.

Also, when I go to interviews I want to be able to speak proudly of the work
I've done.

To me, the only way to get to those objectives is to implement promaya-free
systems. Nobody wants to live in a house with broken windows!

## Further References

- [The Interim Strategy](http://sethgodin.typepad.com/seths_blog/2015/08/the-interim-strategy.html)
- [Broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory)
- [Extreme programming](https://en.wikipedia.org/wiki/Extreme_programming)
- [Contract programming](https://en.wikipedia.org/wiki/Design_by_contract)
- [Defensive programming](https://en.wikipedia.org/wiki/Defensive_programming)
- [Agile Manifesto](http://www.agilemanifesto.org/)
- [Agile is Dead, Long Live Agility](http://pragdave.me/blog/2014/03/04/time-to-kill-agile/)
- [Is TDD Dead?](http://martinfowler.com/articles/is-tdd-dead/)
- [Clojure](http://clojure.org/) A language married to immutability.
