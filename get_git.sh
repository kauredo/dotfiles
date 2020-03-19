#!/bin/bash

sudo apt-get update
sudo apt-get install -y git git-core

git config --global color.ui true
git config --global user.name "kauredo"
git config --global user.email "vaskafig@gmail.com"
ssh-keygen -t rsa -b 4096 -C "vaskafig@gmail.com"

echo need to run "=>" cat ~/.ssh/id_rsa.pub
echo save it in https://github.com/settings/ssh
echo test with "=>" ssh -T git@github.com