---
layout: post
title: "RxAndroid at #JavaSkop"
categories: presentation
excerpt: "Speaker notes for RxAndroid presentation at #JavaSkop 2015, a local JUG conference."
---

I wanted to give a presentation for [RxAndroid](https://github.com/ReactiveX/RxAndroid) at the local [JavaSkop 2015](http://jug.mk/event/java-day/2015-12-13-javaskop.html) JUG 
conference. I was unable to do so, but this is the presentation and the speaker
notes.

<script async class="speakerdeck-embed" data-id="30e8368cf1504edb877fbe8281dcb545" data-ratio="1.49926793557833" src="//speakerdeck.com/assets/embed.js"></script>

Presentation is 20 minutes long. It is divided into three sections, of about 5 minutes each: Introduction to Reactive Extensions, RxAndroid + RxJava, Android Best Practices.

## Introduction to Reactive Extensions

Reactive Extensions is a special way of thinking about processing data. It is an API initially introduced by Microsoft for .NET but later on developed for other platforms and languages. Most implementations share common naming and functionality.

## The big picture: Observables, Observers, Subscriptions.

At the heart of RX are Observables. An "observable" is a sequential process that generates some data. You can think of a factory as an Observable: the factory makes cookies, one at a time. You can look at them, riding a conveyor belt. You can smell their awesomeness. You watch hopelessly as a robot packages them and trucks ship them off to a store that's never near enough to you.

You can think of the factory as a black box. Do you really care how the cookies are made? No. But you do care about when they are made and how you can eat them.

So let's eat them.

You are the Observer. You can pick up the cookies, one by one. And eat them. Or package them. Or burn them. (Low carb diet.) But at the core of this whole endeavour lies a very special relationship of the factory producing and you consuming. This relationship is a Subscription.

The cool thing about relationships is that they are awesome when they're great. When they no longer work for us, we can (and should) stop them.

Ok, so how does all of this help me as an engineer?

Observables are black boxes that produce data. (Single responsibility principle.)
Observers consume data. (Information hiding.)
Subscriptions are the glue. (Weak coupling.)

But there is more! Since the Observable and Observer are weakly coupled, you can very easily use a Scheduler to observe a process taking place somewhere else, without even thinking about synchronization.

## RxAndroid + RxJava

RxAndroid is an extension over RxJava that simply just adds a Scheduler that is bound to Android's main thread.

But, here's a simple example:

```java
interface CookieFactory {
     /** Makes cookies for consumption. */
     Observable<Cookie> cookies();
}
                      
cookieFactory.cookies().forEach(/* onNext */ new Action1<>() {
     @Override
     public void call(Cookie cookie) {
         eat(cookie);
     }
}, /* onError */ new Action1<>() {
     @Override
     public void call(Throwable throwable) {
         call(911);
     }
}, /* onCompleted */ new Action0() {
     @Override
     public void call() {
         cry();
     }
});
```

What you can see from the example is that the CookieFactory exposes an observable process that produces Cookies. Great. Now, we can "watch" over this process and: eat the cookies (`onNext`) when they arrive, call 911 (`onError`) when the factory breaks down, and be sad when the factory stops making cookies (`onCompleted`). These are the three ways in which a process can be observed.

You can think of this `forEach` example as a simple "iteration" over the cookie making. But we can do other cool things. Like:

```java
/** Makes boxes of cookies. */
Observable<DeliciousBox> boxesOfCookies() {
     return cookies().buffer(10).map(new Func1<...>() {
         @Override
         public DeliciousBox call(List<Cookie> cookies) {
              return package(cookies);
         }
     };
}
```

So this will create a new process, let's call it "boxes of cookies" that will take 10 cookies at a time and then package up those cookies into a DeliciousBox. Because these are two separate processes, with a slight modification we can observe them in parallel:

```java
Observable<DeliciousBox> boxesOfCookies() {
     return cookies()
            .subscribeOn(Schedulers.newThread())
            .buffer(10)
            .map(new Func1<...>() {
                 @Override
                 public DeliciousBox call(List<Cookie> cookies) {
                      return package(cookies);
                 }
             };
}
```

And you can sort of see where this is going. The cookies process implicitly sends messages to the boxes process. We can also change an Observable's "execution" thread by using the subscribeOn operator. The default thread in which execution happens, is the thread that creates the subscription.

And so, to give an Android specific example:

```java
class MainAtivity extends Activity {
  
     Subscription friends;

     @Override
     public void onResume() {
         friends = Facebook.friendsFor(user)
              .subscribeOn(Schedulers.newThread()) // loading of friends happens on a new thread
              .observeOn(AndroidSchedulers.mainThread()) // friends are shown on the main thread
              .subscribe(
                 /* onNext */      showFriend,
                 /* onError */     showError,
                 /* onCompleted */ yay);
     }

     @Override
     public void onPause() {
         friends.unsubscribe(); // stops the process, kills the thread, disconnects HTTP request
     }
}
```

In this pretty standard MainActivity, you want to load all of a user's Facebook friends. You want to do that `onResume` (for obvious reasons), and do it asynchronosly. So, when subscribing to the friendsFor observable, you can specify which thread the execution (think subscription) should happen on (new thread), and on what thread you want to observe the Friends, errors and completion (Android's main thread).

As you probably already know, the Activity can go away at any time. So, if that happens we simply unsubscribe from the observable. This stops the loading of friends. What's cool is that it does not leak the Activity instance, and, if the friend loading process has been implemented correctly, you can get true cancellation. Meaning: the loading won't continue silently in the background, the loading will be cancelled, and the thread stopped.

Most Android devices are multicore. You no longer have excuses to use only one core. No more AsyncTasks (bleh!). No more Loaders (really, Google?). No more thinking you're a threading guru.

And how do you create an Observable? Simple:

```java
Observable.create(new Observable.OnSubscribe<Cookie>() {
     @Override
     public void call(Subscriber<Cookie> subscriber) {
         // blocking is OK here

         try {
             while (!subscriber.isSubscribed()) {
                 // make the cookies while we have someone to eat them
                 subscriber.onNext(makeCookie());
             }

             subscriber.onCompleted();
         } catch (Throwable t) {
             subscriber.onError(t);
         }
     }
});
```

## What you get

* Process decoupled from implementation, place of execution.
* Composition of processes to form new processes.
* Testable code. Yay for Quality!
* Synchronization no longer a (big) issue.
* Truly cancellable operations. (More or less.)
* Seamless integration with Android's main thread.

## Things to have in mind

* Keep data immutable.
* Order of subscribeOn / observeOn does not matter.
* Call subscribeOn / observeOn immediately before subscription. Avoid assumptions.
* Use toBlockingObservable() sparingly, only when you really have to block.
* cache() is my favorite operator. <3 

## Take Away

* Observables are processes that emit data.
* Observers use the data.
* Subscriptions are what links Observables with Observers.
* `subscribeOn()` to change execution Scheduler
* `observeOn()` to change observation Scheduler

Go wild!









<script async class="speakerdeck-embed" data-slide="1" data-id="30e8368cf1504edb877fbe8281dcb545" data-ratio="1.49926793557833" src="//speakerdeck.com/assets/embed.js"></script>
