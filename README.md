# loopback-connector-firestore
Firebase Firestore connector for the LoopBack framework.

**This project still under development**

I needed an easy way to connect a Loopback application to [Firebase][7]'s NoSQL database [Firestore][6] so that i decided to build this connector.

#### Installation
If you want to know how to get started with Loopback [check this][5].

To add a new data source, use the data source generator:
```sh
lb datasource
```
Then the data source generator will prompt some questions like

 - Enter the data-source name: **Firestore** *(Choose your prefered name)*
 - Select the connector for Firestore: **other**
 - Enter the connector's module name **loopback-connector-firestore**
 - Install loopback-connector-firestore (Y/n) **y**

Then you should use a service account. Go to [Project Settings > Service Accounts][4] in the Cloud Platform Console. Generate a new private key and save the JSON file in the Loopback's `server` directory

#### Inspiration
I've got inspired by the Official [MongoDB connector][3] by Loopback

#### License

Copylefted (c) 2017 [Dyaa Eldin Moustafa][1] Licensed under the [MIT license][2].


  [1]: https://dyaa.me/
  [2]: https://github.com/dyaa/loopback-connector-firestore/blob/master/LICENSE
  [3]: https://github.com/strongloop/loopback-connector-mongodb/
  [4]: https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts
  [5]: http://loopback.io/getting-started/
  [6]: https://firebase.google.com/products/firestore/
  [7]: https://firebase.google.com
