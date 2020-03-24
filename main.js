const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu } = electron;

let mainWindow;

app.on('ready', function() {

    mainWindow = new BrowserWindow({});

    mainWindow.loadURL('https://class4corona.com')

    const mainMenu = Menu.buildFromTemplate(menuTemplate)

    Menu.setApplicationMenu(mainMenu)
});

const menuTemplate = [{
    label: 'File',
    submenu: [{
            label: 'Host Class',
            click() {

            }
        },
        {
            label: 'Quit',
            accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click() {
                app.quit()
            }
        }
    ]
}]