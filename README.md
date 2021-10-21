# api-node-auth
JWT authentication for ApiCujae 

## Installation

1- Clone repository from GitHub

2- Run npm install 

## Installed Packages
* cors
* fs
* node-jose
* jsonwebtoken
* jwks-rsa
* express

## Requisites
* MongoDB

## Run development Server
```
npm run dev
```
## Run production Server
```
npm run start
```

## Enpoints

>/jwks Known public keys **GET**

>/user Get user Data From Api Cujae **POST**

* Request Headers
    - Autorization > With Bearer TOKEN

* Request Body
    - audience
