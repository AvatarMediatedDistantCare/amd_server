# Requirements
* Ubuntu 14.04 LTS or later/Amazon Linux
* Node.js v0.10.x or later
  * npm
* Nginx v1.3.14 or later


# Installation

## Environments
* Ubuntu 14.04 LTS / 14.10
* Amazon Linux

## Overview
This installation consists of setting up the following components:

1. Packages and Dependencies
1. Clone the source
1. Nginx
1. Start server

## 1. Packages and Dependencies
Update package control system.

```
# Ubuntu
sudo apt-get update
sudo apt-get upgrade

# Amazon Linux
sudo yum update
```

Install the required packages.

```
# Ubuntu
sudo apt-get install -y nodejs npm
sudo apt-get install git

# Amazon Linux
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash
sudo yum -y install nodejs
sudo yum install git
```

### 2. Clone the source
**Note:** You have to register your public key with Gitlab as `Deploy Key`.
```
cd ~
git clone git@github.com:DaiHasegawa/amd_server.git

# npm instal
cd ~
npm install forever --global
cd amd_server
npm install
```

### 3. Nginx
Install Nginx.
```
# Ubuntu
sudo apt-get install nginx

# Amazon Linux
sudo yum install nginx
```

Copy config.
```
cp lib/nginx.conf /etc/nginx/nginx.conf
```

Restart Nginx.
```
sudo service nginx restart
```

### 4. Start Server
```
# start
$ npm run-script production_start

# stop
$ npm run-script production_stop
```


## OS X (for developers)
### Install node.js
```sh
brew install node
```

### clone the source
```sh
git clone git@github.com:DaiHasegawa/amd_server.git
```

### Install libraries
```sh
cd amd_server
npm install forever --global
npm install
```

### develop
```sh
npm run-script develop
```
then, you can access "http://localhost:3000" on your browser.
