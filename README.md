## Start the application in electron
### `Development Mode`
```sh
$ npm start // start the react webpack-dev server
$ npm run electron-dev
```
The electron app will automatically reload when a change in source code is detected.

### `Production Mode`
```sh
$ npm run build // react production build
$ npm run electron
```
electron will run the built files in the ./build directory