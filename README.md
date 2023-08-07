# ldapjs-reproduction

https://github.com/ldapjs/node-ldapjs/issues/923

## Difference between repo and local setup

The only thing missing in this repo is a functional LDAPJS URL for the `createClient`, certificates and DN/GN strings in the `updateUserGroup` function on line 82.

## Build/Run

`npm i ;; node .\api.js`

## Response

Even with the correct setup, the Bunyan logger shows that an empty object `object: {}` is being sent to the LDAPJS.

```json
{
   "name": "ldapjs",
   "component": "client",
   "hostname": "x",
   "pid": 33960,
   "clazz": "Client",
   "ldap_id": "x",
   "level": 10,
   "msg": "sending request {\"messageId\":3,\"protocolOp\":102,\"type\":\"ModifyRequest\",\"object\":{},\"changes\":[{\"operation\":\"add\",\"modification\":{\"type\":\"member\",\"values\":[\"CN=xx\"]}}],\"controls\":[]}",
   "time": "2023-08-02T11:58:39.461Z",
   "v": 0
}
```

## Solution

Return `input` instead of `DN.fromString(input)` on line `81` in `node_modules\ldapjs\lib\client\client.js`

```js
function ensureDN(input) {
   if (DN.isDn(input)) {
      return DN;
   } else if (typeof input === 'string') {
      // return DN.fromString(input)
      return input;
   } else {
      throw new Error('invalid DN');
   }
}
```
