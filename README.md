# Nordcast

Nordcast is a podcast streaming app by koyu.space

## Building

### Prerequisites

- Visual Studio Code
- Visual Studio Code extension for Cordova
- NodeJS with NPM (Installation through `nvm` recommended)
- Cordova
- Optional: Android or iOS SDK
- Optional: Python 3 with PIP for the backend

### Building the app

Open the repository in Visual Studio Code and click the debugger on the left ribbon. From there you can choose many ways to run the app. If the simulator errors just continue, it may print errors into the console, but these are mostly gone in production builds. The app should behave quite well though.

### Using a local backend

Install the prerequisites for Python 3 with `sudo pip install -r requirements.txt` and then run the backend with `DEBUG=true python3 backend.py`. After that modify the `www/config.js` file and change the `backend` variable to your local backend. Usually this is `http://localhost:9000`. If you want to debug remotely replace `localhost` with your local IP address. Remotely debugging in the same network as your testing device is recommended and sufficient.

## Admin backend

If you need a graphical admin backend please have a look at the `admin.html` file in this repository. The default admin key is `x` and we recommend it to change to prevent unauthorized admin access by setting an environment variable called `ADMINKEY` when running the backend server.

## License

Please have a look at the `LICENSE.md` file. Nordcast is licensed under GPLv3.

## Help and Support

If you found a bug open an issue ticket. If you need help or found a critical security vulnerability, do not use public channels like the issue ticket function and instead contact koyu.space support at support@koyu.space.