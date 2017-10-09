# loopback-connector-firestore
Firebase Firestore connector for the LoopBack framework.

[![wercker status](https://app.wercker.com/status/5e9652f63a609040f049a790e98c667a/s/master "wercker status")](https://app.wercker.com/project/byKey/5e9652f63a609040f049a790e98c667a)
[![npm](https://img.shields.io/npm/dt/loopback-connector-firestore.svg)](https://www.npmjs.com/package/loopback-connector-firestore)
[![npm](https://img.shields.io/npm/v/loopback-connector-firestore.svg)](https://www.npmjs.com/package/loopback-connector-firestore)
[![npm](https://img.shields.io/npm/l/loopback-connector-firestore.svg)](https://github.com/dyaa/loopback-connector-firestore)

I needed an easy way to connect a Loopback application to [Firebase][7]'s NoSQL database [Firestore][6] so that i decided to build this connector.

### Installation
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

Then you should use a service account. Go to [Project Settings > Service Accounts][4] in the Google Cloud Platform Console. Generate a new private key and save the JSON file.

You should fill the application's datasource file which is located in `/server/datasources.json`  with those details, You can find them in the downloaded JSON file from the Google Cloud Platform.

```javascrpt
"firestore": {
  "name": "firestore",
  "projectId": "",
  "clientEmail":  "",
  "privateKey": "",
  "databaseName": "" // Optional, Default: projectId
}
```

#### Connection properties

| Property | Type&nbsp;&nbsp; | Description | --- |
| --- | --- | --- | --- |
| projectId | String | project_id in the JSON file | --- |
| clientEmail | String | client_email in the JSON file | --- |
| privateKey | String | private_key in the JSON file | --- |
| databaseName | String | Firebase's project id | Optional, Default: projectId | --- |

And you can actually store those private details as an Environment variables, Check [source-configuration][8]

### Inspiration
I've got inspired by the Official [MongoDB connector][3] by Loopback

### TODO

 - Add test
 - Make Service Account Key name and path an option

### License

Copylefted (c) 2017 [Dyaa Eldin Moustafa][1] Licensed under the [MIT license][2].


  [1]: https://dyaa.me/
  [2]: https://github.com/dyaa/loopback-connector-firestore/blob/master/LICENSE
  [3]: https://github.com/strongloop/loopback-connector-mongodb/
  [4]: https://console.cloud.google.com/projectselector/iam-admin/serviceaccounts
  [5]: http://loopback.io/getting-started/
  [6]: https://firebase.google.com/products/firestore/
  [7]: https://firebase.google.com
  [8]: https://loopback.io/doc/en/lb3/Environment-specific-configuration.html#data-source-configuration
