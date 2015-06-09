---
layout: post
title:  "An OpenCL™ Spring"
categories: gpgpu crypto
excerpt: I spent a sizable amount of time this spring working on my first OpenCL™ project. I outline some of the problems I ran into and discuss the challenges of the platform.
---

I spent a sizable amount of time this spring working on my first OpenCL™ project.
Sadly, due to bad crypto-laws and a shaky democracy, I'm not at liberty to
discuss much about it to non-residents.

For the uninitiated, [OpenCL](https://www.khronos.org/opencl/) is a general
purpose computing platform for all sorts of computation devices ranging from
CPUs, GPUs to weirdly curious FPGA devices. It features APIs and a language
based on C99.

## APIs Are Badly Designed

My impression is that the APIs are very badly designed. They are extremely
verbose and the error handling mechanism is flawed. But, I guess this is true
for almost all C libraries.

Anyhow, the most annoying part is the design of these
[<code>clGetInfo()</code>](https://www.khronos.org/registry/cl/sdk/1.0/docs/man/xhtml/clGetDeviceInfo.html) functions.

I highly recommend using the slightly less verbose, but awfully documented [C++
API](https://www.khronos.org/registry/cl/api/1.1/cl.hpp).

I used the exception model, but do not be surprised when your exception gives
absolutely no information on what the exception really is. It's just a wrapper
over the already bad C API.

## Execution Model, The Machine

I was primarily implementing a data-parallel algorithm, something to do with
[finite fields](https://github.com/hf/galois).

What I was stuck on most of the time, was not the implementation itself, but
trying to figure out a way to test the code that I uploaded to the GPU.

Most OpenCL implementations support a `printf()` function, with limited memory.
It was my (not) fun experience of finding out that if you somehow `printf()`
too much data, and that is very easy to do, you actually start overwriting
global memory. Suddenly, `printf()` is breaking your implementation.

Another thing I got especially stuck on, is trying to figure out ways on how
to limit branching instructions. Data-parallel architectures are [notoriously
bad](http://http.developer.nvidia.com/GPUGems2/gpugems2_chapter34.html) at them.

Usually, checking for either a zero or one, or parity can be dealt with
multiplication operations or similar. It all depends on what you're trying
to achieve.

When loops go infinite, you deal with hardware. If you
somehow block the GPU for about 5-6 seconds, it shuts down and then restarts.
This usually broke Google Chrome (which uses the GPU I guess). I then watched
some talk on the details of the implementation of X11's
[DRI](http://en.wikipedia.org/wiki/Direct_Rendering_Infrastructure), where the
presenter outlined this very same problem and came to the conclusion that it
is a hardware *feature*. There is no going around hardware features like that.

### Memory

When working with an OpenCL platform, you have a limited amount of memory to
work with. I found that spatial complexity of your implementation is especially
important to consider. There are no goodies like virtual memory or memory-mapped
files in OpenCL.

### Randomness

Did you know that generating random numbers in a data-parallel architecture is
incredibly difficult? Generating cryptographically-secure random numbers is
even more difficult.

There are a few data-parallel random number generators out there
([MTGP](http://www.math.sci.hiroshima-u.ac.jp/~m-MAT/MT/MTGP/index.html)), but
many of them are either not random enough or very difficult to implement or
integrate with. I hear CUDA has built in ones, that's good.

Probably my greatest revelation is the
[Quadratic-residuosity problem](http://en.wikipedia.org/wiki/Quadratic_residuosity_problem)-based
[Blum Blum Shub](http://en.wikipedia.org/wiki/Blum_Blum_Shub), a
cryptographically secure RNG that is incredibly easy to parallelize. Sadly, this
one is very difficult to implement due to the fact that there are no
multiple-precision libraries for OpenCL. (No, 32-bit primes are not secure.)

## Drivers and the OS

I primarily use Linux. I usually expect things that depend on drivers not to
work on the first try. They did not.

My laptop has an Intel® Haswell Mobile GPU and an NVIDIA® 740M GPU. I found that
running on the NVIDIA GPU was an incredible hassle. Not to mention the fact that
the NVIDIA supplied OpenCL library spewed out warnings all over the place.

I disabled the NVIDIA® OpenCL ICD (by removing `/etc/OpenCL/vendors/nvidia.icd`),
and was doing all of my testing on the Intel
[Beignet](http://www.freedesktop.org/wiki/Software/Beignet/) driver. The driver
is not without flaws, especially not on Haswell, but was at least working.

On Haswell, the Beignet driver does not support transferring data to the
`__local` memory space of the GPU. This is a bummer since you can not design
and test your algorithms with the advantages it offers. Luckily, my algorithm
did not really need the speed of local memory.

## Conclusions

I was very disappointed to learn that OpenCL support was so bad on commodity
hardware. This means that accelerated apps with OpenCL still have a long way to
go on Linux. (Like most things.)

In the future I would seriously consider measuring spatial complexity before
hand, as it turned out that memory is a very bad bottleneck for data-intensive
algorithms.

The OpenCL community, as well as vendors, should definitely start investing in
the development of a cross-platform debugger and maybe some development tools.
`printf()` does not cut it.
