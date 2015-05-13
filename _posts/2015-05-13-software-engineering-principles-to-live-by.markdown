---
layout: post
title:  "Software Engineering Principles to Live By"
categories: engineering
---

For a while now I've been abiding by these few principles whenever working on
any kind of software development, and they make my life easier. Even when they
don't.

## README.md

Before starting a project I tend to write an informal README. It outlines the
project. It answers questions like:

+ What does it stand for?
+ What is the problem it solves?
+ How the solution should look like?

But, most importantly it enumerates a few rules that will govern the execution
of the project.

So for example, in a C++ project one of those no-break rules, for me, would be
[RAII](http://en.wikipedia.org/wiki/Resource_Acquisition_Is_Initialization)
everywhere.

## Code Is Where The Tests Are

Code without tests should not be regarded as software. Period. Just think of all
the time you've spent at debugging untested code. Now, multiply that time by
the number of "software developers" in the world. It's a lot.

I also tend to write pretty exhaustive tests. I think that the 'tests should be
fast' phenomenon is counter-productive and somewhat of a meta-problem. (Who
tests the testers?)

Tests are the only spec and anything else just gets in the way. Documentation
is based off the results of the tests. Thus, there will be no inconsistent
behavior and the lovely problem of bugs as features.

## Types are Good, Prototypes are Better

Well, unless you're using [Scala](http://www.scala-lang.org/).

I've recently been writing a lot of C / C++ code and it's a bit overwhelming as
to how some things are not obvious to the compiler. It's also remarkable how
many things are not obvious to the developer.

So, I prototype the most critical code in a dynamic language (say, Ruby) and
then when I've made sure that the implementation is close to what I want, I'll
go ahead and implement it in the low(er) level language.

Usually keeping the prototype code look like low-level helps, although it's not
necessary.

This has proven useful when implementing scientific-type things, like finite
fields, where algorithms are not extremely obvious and errors are difficult to
spot.

## Less Is More; Less Is Beautiful

Code should be clear and beautiful. In 70 years of programming languages,
compiler technology has advanced so much that incomprehensible lines of code
really do not take away from the speed of the compiled code.

Compressing your statements to entropy just makes you slow, like gzip. The
compiler and machine don't even care. You should.

## Desperate: Kanban!

Whenever you find yourself clueless as to what to do next, take some time off,
come up with a [Kanban](http://en.wikipedia.org/wiki/Kanban) board and go from
there. You can't go very much wrong.

I particularly like Kanban since you can easily sneak it in projects that don't
formally have that kind of a structure, or even into ones that don't have any
structure. It's the best thing I've seen for management of everything and
anything, especially software.

## Conclusions

Freedom comes from the constraints. Set them up properly and you'll waste much
less time on unproductive and frustrating things.

If it all becomes boring: think about the last time you were frustrated by the
most trivial bug. If it is really boring, change something, but one thing at a
time.

Always improve; don't get lazy.
