# api-node-auth
JWT authentication

## Installation

1- Clone repository from GitHub.

2- Run npm install .

3- Create .env file with API_PORT and MONGO_URI consts.

4- Create private and public keys.

5- Configure Keys.json with public key

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

>**/jwks** Known public keys **GET**

>**/user** Get user Data From Api Cujae **POST**

* Request Headers
    - Autorization > With Bearer TOKEN

* Request Body
    - audience

>**/auth** Authenticate User **POST**

* Request Body
    - username
    - password
    - audience

>**/verify** Example of verifying JWT in JavaScript **POST**

* Request Headers
    - Autorization > With Bearer TOKEN

* Request Body
    - audience

