//! Copyright (c) 2017-2020 Puskás Zsolt <errotan@gmail.com> See LICENSE file for conditions.

import { promises as fs } from 'fs';
import CryptoJS from 'crypto-js';
import LPMPasswords from './password';

let storeFilePath = 'passwords.json';
let mainPassword: string;
let passwords: LPMPasswords;

function setFilePath(path: string): void {
  if (mainPassword) {
    throw new Error('Close store before changing path!');
  }

  storeFilePath = path;
}

// read password file, parse and load to passwords object
async function readPasswordFile() {
  let data;

  try {
    data = await fs.readFile(storeFilePath, 'utf8');
  } catch (e) {
    throw new Error('Fatal error! Can\'t read password file!');
  }

  try {
    passwords = JSON.parse(data);
  } catch (e) {
    throw new Error('Fatal error! Password file is corrupted!');
  }
}

async function passwordFileValid() {
  try {
    await fs.access(storeFilePath);
    if (!mainPassword) {
      await readPasswordFile();
    }

    if (passwords && passwords.list && passwords.list.length) {
      return true;
    }

    await fs.unlink(storeFilePath);
    return false;
  } catch (error) {
    return false;
  }
}

function decryptString(string: string) {
  return CryptoJS.AES.decrypt(string, mainPassword).toString(CryptoJS.enc.Utf8);
}

function encryptString(string: string) {
  return CryptoJS.AES.encrypt(string, mainPassword).toString();
}

function passwordValid() {
  if (passwords.list.length) {
    return decryptString(passwords.list[0].pw).length !== 0;
  }
  return false;
}

function decryptEntry(id: number, index: 'un' | 'web' | 'pw') {
  if (passwords.list[id][index].length > 0) {
    passwords.list[id][index] = decryptString(passwords.list[id][index]);
  }

  return passwords.list[id][index];
}

function encryptEntry(id: number, index: 'un' | 'web' | 'pw') {
  if (passwords.list[id][index].length > 0) {
    passwords.list[id][index] = encryptString(passwords.list[id][index]);
  } else {
    passwords.list[id][index] = '';
  }
}

// encrypt or decrypt rows
function processRows(type: string) {
  for (let i = 0; i < passwords.list.length; i += 1) {
    if (type === 'encrypt') {
      encryptEntry(i, 'web');
      encryptEntry(i, 'un');
      encryptEntry(i, 'pw');
    } else {
      decryptEntry(i, 'web');
      decryptEntry(i, 'un');
      decryptEntry(i, 'pw');
    }
  }
}

async function open(password: string) {
  if (password.length < 8) {
    throw new Error('Password needs to be at least 8 character long!');
  }

  mainPassword = password;

  if (await passwordFileValid()) {
    await readPasswordFile();

    try {
      if (passwordValid()) {
        processRows('decrypt');
      } else {
        throw new Error();
      }
    } catch (error) {
      throw new Error('Password invalid!');
    }
  } else {
    passwords = new LPMPasswords();
  }
}

function checkOpen() {
  if (!passwords) {
    throw new Error('Store must be opened first!');
  }
}

function getPasswords() {
  checkOpen();

  return passwords.list;
}

// save passwords to json file
async function savePasswords() {
  // sort array
  passwords.list.sort((a, b) => a.web.localeCompare(b.web));

  processRows('encrypt');

  try {
    await fs.writeFile(storeFilePath, JSON.stringify(passwords), 'utf8');
  } catch (error) {
    throw new Error('Fatal error! Can\'t save password file!');
  }

  processRows('decrypt');
}

async function savePassword(id: number, web: string, un: string, pw: string) {
  checkOpen();

  passwords.list[id].web = web;
  passwords.list[id].un = un;
  passwords.list[id].pw = pw;

  await savePasswords();
}

async function deletePassword(id: number) {
  checkOpen();

  passwords.list.splice(id, 1);

  await savePasswords();
}

async function addPassword(web: string, un: string, pw: string) {
  checkOpen();

  passwords.list.push({ web, un, pw });

  await savePasswords();
}

function close() {
  mainPassword = '';
  passwords = new LPMPasswords();
}

export = {
  setFilePath,
  passwordFileValid,
  open,
  getPasswords,
  savePassword,
  deletePassword,
  addPassword,
  close,
};
