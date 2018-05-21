# How to Deploy

## Environments
* Ubuntu 14.04 LTS / 14.10
* (Amazon Linux)

## Overview
This installation consists of setting up the following components:

1. Packages and Dependencies
1. Node.js
1. Clone the source
1. Nginx

## 1. Packages and Dependencies
Update package control system.

```
sudo apt-get update
sudo apt-get upgrade
```

Install the required packages.

```
sudo apt-get install -y nodejs npm
sudo apt-get install git
```

## 2. Node.js

Create symbolic link to use `nodejs` as `node` command.
```
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

Install Bower.
```
sudo npm install bower --global
```

### 4. Clone the source
**Note:** You have to register your public key with Gitlab as `Deploy Key`.
```
cd ~
git clone git@git.youk.info:scope/server.git

# npm instal
cd server
npm install
```

### 5. Nginx
Install Nginx.
```
sudo apt-get install nginx
```

Copy the example site config.
```
sudo cp lib/nginx/scope_server /etc/nginx/sites-available/scope_server

# Overwrite `*` by hostname
sudo vim /etc/nginx/sites-available/scope_server

sudo ln -s /etc/nginx/sites-available/scope_server /etc/nginx/sites-enabled/scope_server
```

Restart Nginx.
```
sudo service nginx restart
```

## on OS X
### Install node.js
```sh
brew install node
```

### clone the source
```sh
git clone https://git.idea.it.aoyama.ac.jp/scope/server_v2.git
```

### Install libraries
```sh
npm install bower forever --global
npm install
bower install
```

### develop
```sh
npm run-script develop
```