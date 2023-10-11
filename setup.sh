#!/bin/sh

sudo apt-get update
sudo apt-get install wget
sudo apt-get install git
sudo apt-get install redis-server

wget https://repo.anaconda.com/archive/Anaconda3-2023.09-0-Linux-x86_64.sh 
sh Anaconda3-2023.09-0-Linux-x86_64.sh -b -p ~/anaconda3


echo "source ~/anaconda3/etc/profile.d/conda.sh" >> ~/.bashrc
source ~/.bashrc


cd mist

wget -c https://huggingface.co/CompVis/stable-diffusion-v-1-4-original/resolve/main/sd-v1-4.ckpt
mkdir -p  models/ldm/stable-diffusion-v1
mv sd-v1-4.ckpt models/ldm/stable-diffusion-v1/model.ckpt

conda env create -f environments.yml
conda activate mist
pip install --force-reinstall pillow

echo "conda activate mist" >> ~/.bashrc

$mist_directory=pwd

echo "MIST_DIRECTORY={$mist_directory}" >> ../.env

cd ../../

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

source ~/.bashrc
nvm isntall stable

source ~/.bashrc

cd mist-server

npm install
