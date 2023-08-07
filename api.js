const express = require('express');
const app = express();
const ldap = require('ldapjs');
const fs = require('fs');
const Bunyan = require('bunyan');

app.listen(5555, function () {
   console.log('Server started');
});

async function setupclient() {
   const client = ldap.createClient({
      url: 'LDAPS://<url>>:636',
      tlsOptions: {
         rejectUnauthorized: true,
         //    cert: fs.readFileSync('cert.pem'),
         //    ca: fs.readFileSync('ca.pem'),
      },
      reconnect: false,
      log: new Bunyan({
         name: 'ldapjs',
         component: 'client',
         stream: process.stderr,
         level: 'trace',
      }),
   });

   const username = 'username';
   const password = 'password';

   try {
      await new Promise((resolve, reject) => {
         client.starttls({}, [], function (start_err, start_res) {
            client.bind(username, password, (err) => {
               if (err) {
                  console.error('LDAP bind error:', err);
                  reject(new Error(`LDAP bind error: ${err}`));
               } else {
                  console.log('Connected to LDAP');
                  resolve(true);
               }
            });
         });
      });
   } catch (err) {
      client.unbind();
      throw err;
   }

   return client;
}

async function updateUserGroup({ dn, gn }) {
   try {
      const client = await setupclient();
      console.log(dn, gn);
      const change = new ldap.Change({
         operation: 'add',
         modification: {
            type: 'member',
            values: [dn],
         },
      });

      return new Promise((resolve, reject) => {
         client.modify(gn, change, (err) => {
            if (err) {
               console.log(err);
               reject(new Error(err.message));
            } else {
               console.log('la til i gruppe %j', null);
               resolve(null);
            }
         });
      });
   } catch (error) {
      console.error('updateUserGroup error:', error);
      throw new Error(error.message);
   }
}

updateUserGroup({
   dn: '',
   gn: '',
})
   .then(() => console.log('updated user group'))
   .catch(console.error);

//reponse from bunyan (note the empty object):
// {
//    "name": "ldapjs",
//    "component": "client",
//    "hostname": "x",
//    "pid": 33960,
//    "clazz": "Client",
//    "ldap_id": "x",
//    "level": 10,
//    "msg": "sending request {\"messageId\":3,\"protocolOp\":102,\"type\":\"ModifyRequest\",\"object\":{},\"changes\":[{\"operation\":\"add\",\"modification\":{\"type\":\"member\",\"values\":[\"CN=xx\"]}}],\"controls\":[]}",
//    "time": "2023-08-02T11:58:39.461Z",
//    "v": 0
// }
