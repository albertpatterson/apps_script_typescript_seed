import {getMessage} from '../utils/utils';

export function createMenus() {
  SpreadsheetApp.getUi()
      .createMenu('Custom Menu')
      .addItem('Show message', 'showMessage')
      .addToUi();
}

export function showMessage() {
  SpreadsheetApp.getUi().alert(getMessage());
}