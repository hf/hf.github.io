#!/bin/bash

bundle exec scss --update -C --style compressed assets/scss:assets/css

bundle exec jekyll serve $@
