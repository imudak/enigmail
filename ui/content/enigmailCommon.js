/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "MPL"); you may not use this file
 * except in compliance with the MPL. You may obtain a copy of
 * the MPL at http://www.mozilla.org/MPL/
 *
 * Software distributed under the MPL is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the MPL for the specific language governing
 * rights and limitations under the MPL.
 *
 * The Original Code is Enigmail.
 *
 * The Initial Developer of the Original Code is Ramalingam Saravanan.
 * Portions created by Ramalingam Saravanan <svn@xmlterm.org> are
 * Copyright (C) 2001 Ramalingam Saravanan. All Rights Reserved.
 *
 * Contributor(s):
 * Patrick Brunschwig <patrick@mozilla-enigmail.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */

// enigmailCommon.js: shared JS functions for Enigmail

// WARNING: This module functions must not be loaded in overlays to standard
// functionality!

Components.utils.import("resource://enigmail/enigmailCommon.jsm");
Components.utils.import("resource://enigmail/commonFuncs.jsm");
Components.utils.import("resource://enigmail/keyManagement.jsm");


// The compatible Enigmime version
var gEnigmimeVersion = "1.4";
var gEnigmailSvc;
var gEnigPromptSvc;


// Maximum size of message directly processed by Enigmail
const ENIG_MSG_BUFFER_SIZE = 96000;
const ENIG_MSG_HEADER_SIZE = 16000;
const ENIG_UNLIMITED_BUFFER_SIZE = -1;

const ENIG_KEY_BUFFER_SIZE = 64000;

const ENIG_PROCESSINFO_CONTRACTID = "@mozilla.org/xpcom/process-info;1";
const ENIG_IPCBUFFER_CONTRACTID   = "@mozilla.org/ipc/ipc-buffer;1";
const ENIG_PIPEFILTERLISTENER_CONTRACTID = "@mozilla.org/process/pipe-filter-listener;1";
const ENIG_ENIGMAIL_CONTRACTID    = "@mozdev.org/enigmail/enigmail;1";
const ENIG_ENIGMIMELISTENER_CONTRACTID = "@mozilla.org/enigmail/mime-listener;1";
const ENIG_ENIGMIMESERVICE_CONTRACTID = "@mozdev.org/enigmail/enigmimeservice;1";
const ENIG_ENIGMIMEVERIFY_CONTRACTID = "@mozilla.org/enigmail/mime-verify;1";
const ENIG_STRINGBUNDLE_CONTRACTID = "@mozilla.org/intl/stringbundle;1";
const ENIG_LOCAL_FILE_CONTRACTID = "@mozilla.org/file/local;1";
const ENIG_DIRSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";
const ENIG_MIME_CONTRACTID = "@mozilla.org/mime;1";
const ENIG_WMEDIATOR_CONTRACTID = "@mozilla.org/rdf/datasource;1?name=window-mediator";
const ENIG_ASS_CONTRACTID = "@mozilla.org/appshell/appShellService;1";
const ENIG_CLIPBOARD_CONTRACTID = "@mozilla.org/widget/clipboard;1";
const ENIG_CLIPBOARD_HELPER_CONTRACTID = "@mozilla.org/widget/clipboardhelper;1"
const ENIG_TRANSFERABLE_CONTRACTID = "@mozilla.org/widget/transferable;1"
const ENIG_LOCALE_SVC_CONTRACTID = "@mozilla.org/intl/nslocaleservice;1";
const ENIG_DATE_FORMAT_CONTRACTID = "@mozilla.org/intl/scriptabledateformat;1"
const ENIG_ACCOUNT_MANAGER_CONTRACTID = "@mozilla.org/messenger/account-manager;1";
const ENIG_THREAD_MANAGER_CID = "@mozilla.org/thread-manager;1";
const ENIG_SIMPLEURI_CONTRACTID   = "@mozilla.org/network/simple-uri;1";
const ENIG_SEAMONKEY_ID = "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}"


const ENIG_STANDARD_URL_CONTRACTID = "@mozilla.org/network/standard-url;1";
const ENIG_SCRIPTABLEINPUTSTREAM_CONTRACTID = "@mozilla.org/scriptableinputstream;1";
const ENIG_BINARYINPUTSTREAM_CONTRACTID = "@mozilla.org/binaryinputstream;1";
const ENIG_SAVEASCHARSET_CONTRACTID = "@mozilla.org/intl/saveascharset;1";

const ENIG_STREAMCONVERTERSERVICE_CID_STR =
      "{892FFEB0-3F80-11d3-A16C-0050041CAF44}";


const ENIG_ISCRIPTABLEUNICODECONVERTER_CONTRACTID = "@mozilla.org/intl/scriptableunicodeconverter";

const ENIG_IOSERVICE_CONTRACTID = "@mozilla.org/network/io-service;1";

const ENIG_C = Components.classes;
const ENIG_I = Components.interfaces;

// Key algorithms
const ENIG_KEYTYPE_DSA = 1;
const ENIG_KEYTYPE_RSA = 2;


// field ID's of key list (as described in the doc/DETAILS file in the GnuPG distribution)
const ENIG_KEY_TRUST=1;
const ENIG_KEY_ID = 4;
const ENIG_CREATED = 5;
const ENIG_EXPIRY = 6;
const ENIG_UID_ID = 7;
const ENIG_OWNERTRUST = 8;
const ENIG_USER_ID = 9;
const ENIG_SIG_TYPE = 10;
const ENIG_KEY_USE_FOR = 11;

const ENIG_KEY_EXPIRED="e";
const ENIG_KEY_REVOKED="r";
const ENIG_KEY_INVALID="i";
const ENIG_KEY_DISABLED="d";
const ENIG_KEY_NOT_VALID=ENIG_KEY_EXPIRED+ENIG_KEY_REVOKED+ENIG_KEY_INVALID+ENIG_KEY_DISABLED;


// Interfaces
const nsIEnigmail               = ENIG_I.nsIEnigmail;

// Encryption flags
if (nsIEnigmail) {
  const ENIG_SIGN    = nsIEnigmail.SEND_SIGNED;
  const ENIG_ENCRYPT = nsIEnigmail.SEND_ENCRYPTED;
  const ENIG_ENCRYPT_OR_SIGN = ENIG_ENCRYPT | ENIG_SIGN;
}

// UsePGPMimeOption values
const PGP_MIME_NEVER    = 0;
const PGP_MIME_POSSIBLE = 1;
const PGP_MIME_ALWAYS   = 2;

const ENIG_POSSIBLE_PGPMIME = -2081;
const ENIG_PGP_DESKTOP_ATT  = -2082;

var gUsePGPMimeOptionList = ["usePGPMimeNever", "usePGPMimePossible",
                             "usePGPMimeAlways"];

var gEnigRecipientsSelection = ["-",
                                "perRecipientRules",
                                "perRecipientRulesAndEmail",
                                "perEmailAddress",
                                "askRecipientsAlways"];

const ENIG_BUTTON_POS_0           = 1;
const ENIG_BUTTON_POS_1           = 1 << 8;
const ENIG_BUTTON_POS_2           = 1 << 16;
const ENIG_BUTTON_TITLE_IS_STRING = 127;

const ENIG_HEADERMODE_KEYID = 0x01;
const ENIG_HEADERMODE_URL   = 0x10;



function EnigGetFrame(win, frameName) {
  return EnigmailCommon.getFrame(win, frameName);
}

// Initializes enigmailCommon
function EnigInitCommon(id) {
   DEBUG_LOG("enigmailCommon.js: EnigInitCommon: id="+id+"\n");

   gEnigPromptSvc = enigGetService("@mozilla.org/embedcomp/prompt-service;1", "nsIPromptService");
}


function GetEnigmailSvc() {
  if (! gEnigmailSvc)
    gEnigmailSvc = EnigmailCommon.getService(window);
  return gEnigmailSvc;
}

// maxBytes == -1 => read everything
function EnigReadURLContents(url, maxBytes) {
  DEBUG_LOG("enigmailCommon.js: EnigReadURLContents: url="+url+
            ", "+maxBytes+"\n");

  var ioServ = enigGetService(ENIG_IOSERVICE_CONTRACTID, "nsIIOService");
  if (!ioServ)
    throw Components.results.NS_ERROR_FAILURE;

  var fileChannel = ioServ.newChannel(url, null, null)

  var rawInStream = fileChannel.open();

  var inStream = ENIG_C[ENIG_BINARYINPUTSTREAM_CONTRACTID].createInstance(ENIG_I.nsIBinaryInputStream);
  inStream.setInputStream(rawInStream);

  var available = inStream.available()
  if ((maxBytes < 0) || (maxBytes > available))
    maxBytes = available;

  var data = inStream.readBytes(maxBytes);

  inStream.close();

  return data;
}

// maxBytes == -1 => read whole file
function EnigReadFileContents(localFile, maxBytes) {

  DEBUG_LOG("enigmailCommon.js: EnigReadFileContents: file="+localFile.leafName+
            ", "+maxBytes+"\n");

  if (!localFile.exists() || !localFile.isReadable())
    throw Components.results.NS_ERROR_FAILURE;

  var ioServ = enigGetService(ENIG_IOSERVICE_CONTRACTID, "nsIIOService");
  if (!ioServ)
    throw Components.results.NS_ERROR_FAILURE;

  var fileURI = ioServ.newFileURI(localFile);
  return EnigReadURLContents(fileURI.asciiSpec, maxBytes);

}

///////////////////////////////////////////////////////////////////////////////

function WRITE_LOG(str) {
  EnigmailCommon.WRITE_LOG(str);
}

function DEBUG_LOG(str) {
  EnigmailCommon.DEBUG_LOG(str);
}

function WARNING_LOG(str) {
  EnigmailCommon.WARNING_LOG(str);
}

function ERROR_LOG(str) {
  EnigmailCommon.ERROR_LOG(str);
}

function CONSOLE_LOG(str) {
  EnigmailCommon.CONSOLE_LOG(str);
}


// write exception information
function EnigWriteException(referenceInfo, ex) {
  EnigmailCommon.writeException(referenceInfo, ex);
}

///////////////////////////////////////////////////////////////////////////////

function EnigAlert(mesg) {
  return EnigmailCommon.alert(window, mesg);
}

/**
 * Displays an alert dialog with 3-4 optional buttons.
 * checkBoxLabel: if not null, display checkbox with text; the checkbox state is returned in checkedObj
 * button-Labels: use "&" to indicate access key
 *     use "buttonType:label" or ":buttonType" to indicate special button types
 *        (buttonType is one of cancel, help, extra1, extra2)
 * return: 0-2: button Number pressed
 *          -1: ESC or close window button pressed
 *
 */
function EnigLongAlert(mesg, checkBoxLabel, okLabel, labelButton2, labelButton3, checkedObj) {
  return EnigmailCommon.longAlert(window, mesg, checkBoxLabel, okLabel, labelButton2, labelButton3, checkedObj);
}

function EnigAlertPref(mesg, prefText) {
  return EnigmailCommon.alertPref(window, mesg, prefText);
}

// Confirmation dialog with OK / Cancel buttons (both customizable)
function EnigConfirm(mesg, okLabel, cancelLabel) {
  return EnigmailCommon.confirmDlg(window, mesg, okLabel, cancelLabel);
}


function EnigConfirmPref(mesg, prefText, okLabel, cancelLabel) {
  return EnigmailCommon.confirmPref(window, mesg, prefText, okLabel, cancelLabel);
}

function EnigError(mesg) {
  return gEnigPromptSvc.alert(window, EnigGetString("enigError"), mesg);
}

function EnigPrefWindow(showBasic, clientType, selectTab) {
  DEBUG_LOG("enigmailCommon.js: EnigPrefWindow\n");
  EnigmailFuncs.openPrefWindow(window, showBasic, selectTab);
}


function EnigHelpWindow(source) {
  EnigmailFuncs.openHelpWindow(source);
}


function EnigDisplayRadioPref(prefName, prefValue, optionElementIds) {
  DEBUG_LOG("enigmailCommon.js: EnigDisplayRadioPref: "+prefName+", "+prefValue+"\n");

  if (prefValue >= optionElementIds.length)
    return;

  var groupElement = document.getElementById("enigmail_"+prefName);
  var optionElement = document.getElementById(optionElementIds[prefValue]);

  if (groupElement && optionElement) {
    groupElement.selectedItem = optionElement;
    groupElement.value = prefValue;
  }
}

function EnigSetRadioPref(prefName, optionElementIds) {
  DEBUG_LOG("enigmailCommon.js: EnigSetRadioPref: "+prefName+"\n");

  try {
    var groupElement = document.getElementById("enigmail_"+prefName);
    if (groupElement) {
      var optionElement = groupElement.selectedItem;
      var prefValue = optionElement.value;
      if (prefValue < optionElementIds.length) {
        EnigSetPref(prefName, prefValue);
        groupElement.value = prefValue;
      }
    }
  }
  catch (ex) {}
}

function EnigSavePrefs() {
  return EnigmailCommon.savePrefs();
}

function EnigGetPref(prefName) {
  return EnigmailCommon.getPref(prefName);
}

function EnigGetDefaultPref(prefName) {
  DEBUG_LOG("enigmailCommon.js: EnigGetDefaultPref: prefName="+prefName+"\n");
  var prefValue=null;
  try {
    EnigmailCommon.prefBranch.lockPref(prefName);
    prefValue = EnigGetPref(prefName);
    EnigmailCommon.prefBranch.unlockPref(prefName);
  }
  catch (ex) {}

  return prefValue;
}

function EnigSetPref(prefName, value) {
  return EnigmailCommon.setPref(prefName, value);
}

function EnigGetSignMsg(identity) {
  EnigmailFuncs.getSignMsg(identity);
}


function EnigConvertFromUnicode(text, charset) {
  DEBUG_LOG("enigmailCommon.js: EnigConvertFromUnicode: "+charset+"\n");

  if (!text)
    return "";

  if (! charset) charset="utf-8";

  // Encode plaintext
  try {
    var unicodeConv = ENIG_C[ENIG_ISCRIPTABLEUNICODECONVERTER_CONTRACTID].getService(ENIG_I.nsIScriptableUnicodeConverter);

    unicodeConv.charset = charset;
    return unicodeConv.ConvertFromUnicode(text);

  } catch (ex) {
    DEBUG_LOG("enigmailCommon.js: EnigConvertFromUnicode: caught an exception\n");

    return text;
  }
}


function EnigConvertToUnicode(text, charset) {
  // DEBUG_LOG("enigmailCommon.js: EnigConvertToUnicode: "+charset+"\n");

  if (!text || !charset /*|| (charset.toLowerCase() == "iso-8859-1")*/)
    return text;

  // Encode plaintext
  try {
    var unicodeConv = ENIG_C[ENIG_ISCRIPTABLEUNICODECONVERTER_CONTRACTID].getService(ENIG_I.nsIScriptableUnicodeConverter);

    unicodeConv.charset = charset;
    return unicodeConv.ConvertToUnicode(text);

  } catch (ex) {
    DEBUG_LOG("enigmailCommon.js: EnigConvertToUnicode: caught an exception while converting'"+text+"' to "+charset+"\n");
    return text;
  }
}

function EnigConvertGpgToUnicode(text) {
  return EnigmailCommon.convertGpgToUnicode(text);
}

function EnigFormatFpr(fingerprint) {
  return EnigmailFuncs.formatFpr(fingerprint);
}

/////////////////////////
// Console stuff
/////////////////////////


// return the options passed to a window
function EnigGetWindowOptions() {
  var winOptions=[];
  if (window.location.search) {
    var optList=window.location.search.substr(1).split(/\&/);
    for (var i=0; i<optList.length; i++) {
      var anOption=optList[i].split(/\=/);
      winOptions[anOption[0]] = unescape(anOption[1]);
    }
  }
  return winOptions;
}

function EnigRulesEditor() {
  EnigmailFuncs.openRulesEditor();
}

function EngmailCardDetails() {
  EnigmailFuncs.openCardDetails();
}

function EnigKeygen() {
  EnigmailFuncs.openKeyGen();

}

// retrieves a localized string from the enigmail.properties stringbundle
function EnigGetString(aStr) {
  var argList = new Array();
  // unfortunately arguments.shift() doesn't work, so we use a workaround

  if (arguments.length > 1)
    for (let i=1; i<arguments.length; i++)
      argList.push(arguments[i]);
  return EnigmailCommon.getString(aStr, (arguments.length > 1 ? argList : null));
}

// Remove all quoted strings (and angle brackets) from a list of email
// addresses, returning a list of pure email addresses
function EnigStripEmail(mailAddrs) {
  return EnigmailFuncs.stripEmail(mailAddrs);
}


//get path for temporary directory (e.g. /tmp, C:\TEMP)
function EnigGetTempDir() {
  return EnigmailCommon.getTempDir();
}

// get the OS platform
function EnigGetOS () {
  return EnigmailCommon.getOS();
}

function EnigGetVersion() {
  return EnigmailCommon.getVersion();
}

function EnigDisplayPrefs(showDefault, showPrefs, setPrefs) {
  DEBUG_LOG("enigmailCommon.js: EnigDisplayPrefs\n");

  var obj = new Object;
  var prefList = EnigmailCommon.prefBranch.getChildList("",obj);

  for (var prefItem in prefList) {
    var prefName=prefList[prefItem];
    var prefElement = document.getElementById("enigmail_"+prefName);

    if (prefElement) {
      var prefType = EnigmailCommon.prefBranch.getPrefType(prefName);
      var prefValue;
      if (showDefault) {
        prefValue = EnigGetDefaultPref(prefName);
      }
      else {
        prefValue = EnigGetPref(prefName);
      }

      DEBUG_LOG("enigmailCommon.js: EnigDisplayPrefs: "+prefName+"="+prefValue+"\n");

      switch (prefType) {
      case EnigmailCommon.prefBranch.PREF_BOOL:
        if (showPrefs) {
          if (prefElement.getAttribute("invert") == "true") {
            prefValue = ! prefValue;
          }

          if (prefValue) {
            prefElement.setAttribute("checked", "true");
          } else {
            prefElement.removeAttribute("checked");
          }
        }

        if (setPrefs) {

          if (prefElement.getAttribute("invert") == "true") {
            if (prefElement.checked) {
              EnigSetPref(prefName, false);
            } else {
              EnigSetPref(prefName, true);
            }
          }
          else {
            if (prefElement.checked) {
              EnigSetPref(prefName, true);
            } else {
              EnigSetPref(prefName, false);
            }
          }
        }

        break;

      case EnigmailCommon.prefBranch.PREF_INT:
        if (showPrefs)
          prefElement.value = prefValue;

        if (setPrefs) {
          try {
            EnigSetPref(prefName, 0+prefElement.value);
          } catch (ex) {}
        }
        break;

      case EnigmailCommon.prefBranch.PREF_STRING:
        if (showPrefs)
          prefElement.value = prefValue;
        if (setPrefs)
          EnigSetPref(prefName, prefElement.value);
        break;

      default:
        DEBUG_LOG("enigmailCommon.js: EnigDisplayPrefs: "+prefName+" does not have a type?!\n");
      }
    }
  }
}

function EnigFilePicker(title, displayDir, save, defaultExtension, defaultName, filterPairs) {
  return EnigmailCommon.filePicker(window, title, displayDir, save, defaultExtension,
                                   defaultName, filterPairs);
}

// get keys from keyserver
function EnigDownloadKeys(inputObj, resultObj) {
  return EnigmailFuncs.downloadKeys(window, inputObj, resultObj);
}

// create new PGP Rule
function EnigNewRule(emailAddress) {
  return EnigmailFuncs.createNewRule(window, emailAddress);
}

function EnigGetTrustCode(keyObj) {
  return EnigmailFuncs.getTrustCode(keyObj);
}

// Load the key list into memory
// sortDirection: 1 = ascending / -1 = descending

function EnigLoadKeyList(refresh, keyListObj, sortColumn, sortDirection) {
  return EnigmailFuncs.loadKeyList(window, refresh, keyListObj, sortColumn, sortDirection);
}

function EnigEditKeyTrust(userIdArr, keyIdArr) {
  return EnigmailFuncs.editKeyTrust(window, userIdArr, keyIdArr);
}

function EnigDisplayKeyDetails(keyId, refresh) {
  return EnigmailFuncs.openKeyDetails(window, keyId, refresh);
}

function EnigSignKey(userId, keyId, signingKeyHint) {
  return EnigmailFuncs.signKey(window, userId, keyId, signingKeyHint);
}


function EnigChangeKeyPwd(keyId, userId) {

  var enigmailSvc = GetEnigmailSvc();
  if (!enigmailSvc)
    return;

  if (! enigmailSvc.useGpgAgent()) {
    // no gpg-agent: open dialog to enter new passphrase
    var inputObj = {
      keyId: keyId,
      userId: userId
    };

    window.openDialog("chrome://enigmail/content/enigmailChangePasswd.xul",
        "", "dialog,modal,centerscreen", inputObj);
  }
  else {
    // gpg-agent used: gpg-agent will handle everything
    EnigmailKeyMgmt.changePassphrase(window, "0x"+keyId, "", "",
      function _changePwdCb(exitCode, errorMsg) {
        if (exitCode != 0) {
          EnigAlert(EnigGetString("changePassFailed")+"\n\n"+errorMsg);
        }
      });
  }
}


function EnigRevokeKey(keyId, userId, callbackFunc) {
  var enigmailSvc = GetEnigmailSvc();
  if (!enigmailSvc)
    return false;

  var userDesc="0x"+keyId.substr(-8,8)+" - "+userId;
  if (!EnigConfirm(EnigGetString("revokeKeyAsk", userDesc), EnigGetString("keyMan.button.revokeKey"))) return;

  var tmpDir=EnigGetTempDir();

  try {
    var revFile = ENIG_C[ENIG_LOCAL_FILE_CONTRACTID].createInstance(EnigGetLocalFileApi());
    revFile.initWithPath(tmpDir);
    if (!(revFile.isDirectory() && revFile.isWritable())) {
      EnigAlert(EnigGetString("noTempDir"));
      return false;
    }
  }
  catch (ex) {}
  revFile.append("revkey.asc");

  EnigmailKeyMgmt.genRevokeCert(window, "0x"+keyId, revFile, "0", "",
    function _revokeCertCb(exitCode, errorMsg) {
      if (exitCode != 0) {
        revFile.remove(false);
        EnigAlert(EnigGetString("revokeKeyFailed")+"\n\n"+errorMsg);
        return;
      }
      var errorMsgObj = {};
      var keyList = {};
      var r = enigmailSvc.importKeyFromFile(window, revFile, errorMsgObj, keyList);
      revFile.remove(false);
      if (r != 0) {
        EnigAlert(EnigGetString("revokeKeyFailed")+"\n\n"+EnigConvertGpgToUnicode(errorMsgObj.value));
      }
      else {
        EnigAlert(EnigGetString("revokeKeyOk"));
      }
      if (callbackFunc) {
        callbackFunc(r == 0);
      }
    });
}

function EnigGetLocalFileApi() {
  return EnigmailCommon.getLocalFileApi();
}

function EnigShowPhoto (keyId, userId, photoNumber) {
  EnigmailFuncs.showPhoto(window, keyId, userId, photoNumber);
}

function EnigGetFilePath (nsFileObj) {
  return EnigmailCommon.getFilePath(nsFileObj);
}

function EnigCreateRevokeCert(keyId, userId, callbackFunc) {
  var defaultFileName = userId.replace(/[\<\>]/g, "");
  defaultFileName += " (0x"+keyId.substr(-8,8)+") rev.asc"
  var outFile = EnigFilePicker(EnigGetString("saveRevokeCertAs"),
                               "", true, "*.asc",
                               defaultFileName,
                               [EnigGetString("asciiArmorFile"), "*.asc"]);
  if (! outFile) return -1;

  var enigmailSvc = GetEnigmailSvc();
  if (!enigmailSvc)
    return -1;

  var errorMsgObj = {};
  EnigmailKeyMgmt.genRevokeCert(window, "0x"+keyId, outFile, "1", "",
    function _revokeCertCb(exitCode, errorMsg) {
      if (exitCode != 0) {
        EnigAlert(EnigGetString("revokeCertFailed")+"\n\n"+errorMsg);
      }
      else {
        EnigAlert(EnigGetString("revokeCertOK"));
      }

      if (callbackFunc) callbackFunc(exitCode == 0);
    });
}


// return the label of trust for a given trust code
function EnigGetTrustLabel(trustCode) {
  var keyTrust;
  switch (trustCode) {
  case 'q':
    keyTrust=EnigGetString("keyValid.unknown");
    break;
  case 'i':
    keyTrust=EnigGetString("keyValid.invalid");
    break;
  case 'd':
  case 'D':
    keyTrust=EnigGetString("keyValid.disabled");
    break;
  case 'r':
    keyTrust=EnigGetString("keyValid.revoked");
    break;
  case 'e':
    keyTrust=EnigGetString("keyValid.expired");
    break;
  case 'n':
    keyTrust=EnigGetString("keyTrust.untrusted");
    break;
  case 'm':
    keyTrust=EnigGetString("keyTrust.marginal");
    break;
  case 'f':
    keyTrust=EnigGetString("keyTrust.full");
    break;
  case 'u':
    keyTrust=EnigGetString("keyTrust.ultimate");
    break;
  case 'g':
    keyTrust=EnigGetString("keyTrust.group");
    break;
  case '-':
    keyTrust="-";
    break;
  default:
    keyTrust="";
  }
  return keyTrust;
}

function EnigGetDateTime(dateNum, withDate, withTime) {
  return EnigmailCommon.getDateTime(dateNum, withDate, withTime);
}

function enigCreateInstance (aURL, aInterface)
{
  return ENIG_C[aURL].createInstance(ENIG_I[aInterface]);
}

function enigGetService (aURL, aInterface)
{
  // determine how 'aInterface' is passed and handle accordingly
  switch (typeof(aInterface))
  {
    case "object":
      return ENIG_C[aURL].getService(aInterface);
      break;

    case "string":
      return ENIG_C[aURL].getService(ENIG_I[aInterface]);
      break;

    default:
      return ENIG_C[aURL].getService();
  }

  return null;
}

function EnigCollapseAdvanced(obj, attribute, dummy) {
  return EnigmailFuncs.collapseAdvanced(obj, attribute, dummy);
}


function EnigOpenURL(event, hrefObj) {
  var xulAppinfo = ENIG_C["@mozilla.org/xre/app-info;1"].getService(ENIG_I.nsIXULAppInfo);
  if (xulAppinfo.ID == ENIG_SEAMONKEY_ID) return;

  try {
    var ioservice  = ENIG_C["@mozilla.org/network/io-service;1"].
                  getService(ENIG_I.nsIIOService);
    var iUri = ioservice.newURI(hrefObj.href, null, null);
    var eps  = ENIG_C["@mozilla.org/uriloader/external-protocol-service;1"].
                  getService(ENIG_I.nsIExternalProtocolService);

    eps.loadURI(iUri, null);

    event.preventDefault();
    event.stopPropagation();
  }
  catch (ex) {}
}

