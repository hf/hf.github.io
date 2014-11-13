#!/bin/bash

scss --update -C --style compressed assets/scss:assets/css

jekyll serve $@
