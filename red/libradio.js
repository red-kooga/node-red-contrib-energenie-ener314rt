/*
** Node-red control of Energenie ENER314-RT board for remote control of radio sockets
** Author: Achronite, December 2018 - March 2019
**
** v0.1
**
** File: libradio.js
** Purpose: Wrap the C library calls to interface with the radio device so they are available from javascript
*/

var ffi = require('ffi');
var ref = require('ref');
var ArrayType = require('ref-array');

var int = ref.types.uint8;
var IntArray = ArrayType(int);
var path = require('path');


// link the C shared object file provided by energenie
var libradio = ffi.Library(path.join(__dirname, '../C/build/Release/radio'), {
  'radio_init': [ 'void', [] ],
  'radio_reset': [ 'void', ['void'] ],
  'radio_get_ver': [ 'uint8', ['void'] ],
  'radio_modulation': [ 'void', ['int'] ],
  'radio_transmitter': [ 'void', [int] ],
  'radio_transmit': [ 'void', [ IntArray, int, int ]],
  'radio_send_payload': [ 'void', [ IntArray, int, int ]],
  'radio_receiver': [ 'void', [int] ],
  'radio_is_receive_waiting': [ 'uint8', ['void'] ],
  'radio_get_payload_len': [ 'uint8', [ IntArray, int ]],
  'radio_get_payload_cbp': [ 'uint8', [ IntArray, int ]],
  'radio_standby':  [ 'void', ['void'] ],
  'radio_finished': [ 'void',  ['void'] ],
  'OokSend':        [ 'uint8', ['uint32', 'uint8', 'uint8', 'uint8'] ],
  'encodeDecimal':  [ 'void', ['uint32', 'uint8', IntArray ]]
});

module.exports = libradio;