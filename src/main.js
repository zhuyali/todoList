'use strict';
process.env.ELECTRON_HIDE_INTERNAL_MODULES = 'true';

var electron = require('electron');
var app = electron.app;
var BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

var startupOpts = {
    useContentSize: true,
    width: 860,
    height: 645,
    center: true,
    resizable: true,
    alwaysOnTop: false,
    fullscreen: false,
    skipTaskbar: true,
    kiosk: false,
    title: '',
    icon: null,
    show: false,
    frame: true,
    disableAutoHideCursor: false,
    autoHideMenuBar: false,
    titleBarStyle: 'default'
};

app.on('ready', function() {

    mainWindow = new BrowserWindow(startupOpts);

    if (process.env.NODE_ENV === 'dev') {
        mainWindow.webContents.on('did-start-loading', function() {
            mainWindow.webContents.executeJavaScript('var script = document.createElement(\'script\');script.type = \'text/javascript\';script.src=\'http://localhost:35729/livereload.js\';document.body.appendChild(script);');
        });
    }
    mainWindow.loadURL('file://' + __dirname + '/../index.html');

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.show();
});
