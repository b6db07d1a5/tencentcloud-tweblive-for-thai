## Tencent Cloud Web Live Interactive Component

### Introduction

Tencent Cloud Web Live Interactive Component with Tencent Cloud web super player - [TcPlayer] (https://cloud.tencent.com/document/product/454/7503) and Tencent Cloud instant messaging IM - [TIM](https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/TIM.html) as the basis, encapsulates the easy-to-use [API](https://webim-1252463788.cos.ap-shanghai.myqcloud.com/tweblive/TWebLive.html), provides a free and open source [Demo] (https://webim-1252463788.cos.ap-shanghai.myqcloud.com/TWebLive-demo.zip suitable for Web live interactive scenes,such as large-scale meetings, events, courses, lectures and other online live, with goods live WeChat H5 sharing, etc., the effect is as follows：

![](https://main.qcloudimg.com/raw/04f7ad86951354ba40f5d85cd204b5f5.jpg)
![](https://main.qcloudimg.com/raw/2c46a40ce36c0faecc01ef12d317e803.png)

### Online experience
WeChat scan QR code! [] (https://user-gold-cdn.xitu.io/2020/5/29/1725f98d5d57713f?w=260&h=260&f=png&s=6258)

Or [point I experience] (https://webim-1252463788.cos.ap-shanghai.myqcloud.com/tweblivedemo/index.html)

### Development background

Front-end development students often encounter such needs：
- Project cycle in a hurry, Party dad anxious to, or the company to do promotional activities, only to less than a week ((like at this person) with, the industry is the norm）
- WeChat sweep, or use the mobile browser sweep will be able to watch live, and can chat with other people to watch live interaction,but also like, gift(give me a tiger tooth or Betta that kind of live effect out!）
- The above features are also required on Windows or Mac browsers (children make choices, product manager: I want them all!）

Development students received such a demand, generally how to achieve it?Have a certain understanding of the web Live will choose flv.js or hls.js to play the live source.Chat interaction quickly write a simple messaging demo with websocket.However, it is not difficult to write a prototype demo, but the next will encounter a lot of challenges：
- How can the server be distributed in order to allow users to access the nearest?Encounter swarming requests, the server can not carry the concurrent pressure how to do?
- The number of live events is often more, users across the country to access, the message channel can not be established how to do?
- Self-developed an IM Server in a short period of time, how to ensure high availability of services?
- Large amount of messages, IM Server push messages encountered performance problems, resulting in message accumulation,or lost messages how to do?
- Users in the live room curse, published yellow, political remarks how to do?
- If you use a third-party IM service, who is better to choose?What if there is a pit, no one cares about the feedback problem,resulting in a project delay?
- Third-party IM services often have a whole bunch of concepts and APIs that take time to become familiar with and use,leaving time to develop business logic too hasty
  
Thus, in a short period of time if you start from scratch Assembly and development, often overtime, catch the duck on the shelves, the development of students exhausted, live effect is not necessarily good.Now live so hot, * * * is there not an open source, a combination of live and chat interactive features of the project, let me change a little change will be able to use it?***

Tencent Cloud terminal R & D Center Web team, developed Tencent Cloud web super player and instant messaging IM SDK (there are other SDKs for the time being Press the table___), in the face of such common needs and pain points, so based on these two reliable and excellent products, developed an open source Tencent Cloud Web Live Interactive Component for developers to use and reference.

### What are the benefits for developers and projects?

##### 1, for developers to save a lot of time to repeat the wheel, you can focus on the development of business logic

To use Tencent Cloud Web Live Interactive Component, developers only need to download [SDK](https://www.npmjs.com/package/tweblive) after a simple Fill in a few parameters,you can quickly put a live video playback, chat interaction, like gifts and other common functions of the project to run up.It looks like this：
```javascript
// npm i tweblive
import TWebLive from 'TWebLive';

let options = {
  SDKAppID: 0, // you need to replace 0 with the SDKAppID of your cloud communication app when accessing
  domID: "id_test_video", / / player container ID on the page, such as <div id= "id_test_video" style= "width:100%; height:auto;" > < / div>
  // Hls and flv stream addresses must be filled in at the same time
  // In browsers that support MSE, the live component will prefer to use flv Live source, with lower delay and better live effect
  // In browsers that do not support MSE, the live component will use the HLS Live source,the delay is slightly larger, but the adaptability is good on the mobile side
  m3u8: "http://200002949.vod.myqcloud.com/200002949_b6ffc.f0.m3u8", / / please replace it with the actual available playback address
  flv: "http://200002949.vod.myqcloud.com/200002949_b6ffc.f0.flv" / / please replace it with the actual available playback address
};
// Create instance
let tweblive = new TWebLive(options);

// When the SDK enters the ready state, the Access side listens for this event,and then calls the SDK to send a message and other APIs to use the SDK's functions
let onIMReady = function() {
  tweblive.sendTextMessage({
    roomID: 'TWebLiveDeveloperHub', / / replace with added Studio ID
    text: 'hello from TWebLive'
  }).then(function(res) {
    console.log('demo sendTextMessage OK', res);
  }).catch(function(err) {
    console.log('demo sendTextMessage failed', err);
  });
}
tweblive.on(TWebLive.EVENT.IM_READY, onIMReady);

// Receive a text message from someone else in the studio
let onTextMessageReceived = function(event) {
  event.data.forEach(function(message) {
    // There is a nickname with a nickname,no nickname with userID
    console.log('demo ' + (message.nick || message.from) + ' say:', message.payload.text);
  });
}
tweblive.on(TWebLive.EVENT.TEXT_MESSAGE_RECEIVED, onTextMessageReceived);

// Receive custom messages from other people in the live room, such as gifts, likes, etc.
let onCustomMessageReceived = function(event) {
  event.data.forEach(function(message) {
    console.log('demo ' + 'data:' + message.payload.data + ' description:' + message.payload.description + ' extension:' + message.payload.extension);
  });
}
tweblive.on(TWebLive.EVENT.CUSTOM_MESSAGE_RECEIVED, onCustomMessageReceived);

// Receive notifications from others to join the studio
let onRemoteUserJoin = function(event) {
  event.data.forEach(function(message) {
    // There is a nickname with a nickname,no nickname with userID
    console.log('demo ' + (message.nick || message.payload.userIDList[0]) + 'coming');
  });
}
tweblive.on(TWebLive.EVENT.REMOTE_USER_JOIN, onRemoteUserJoin);

// For more events, please refer to: https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/module-EVENT.html

// Join the live studio, Anonymous join the live studio when not logged in, can only receive messages, can not send messages
tweblive.enterRoom (" " ); / / fill in the live studio ID to be added when accessing, corresponding to the groupID of the AVCHATROOM of the IM system

```

##### 2, for developers to save a lot of time to locate and solve the problem

- The number of live scene viewers, when a large amount of messages, self-Research Services prone to performance bottlenecks, such as the server can not carry concurrent pressure leads to low request success rate, message accumulation, lost messages, messaging delay serious and other difficult to troubleshoot and difficult to solve the problem.Tencent Cloud Web Live Interactive component's messaging service integrates Tencent Cloud instant messaging IM,based on QQ'S many years of IM capabilities, to ensure high concurrency, high reliability of instant messaging capabilities, and has a perfect statistical and log troubleshooting system, encountered problems can be quickly positioned to solve.
- Tencent Cloud Web Live Interactive Component supports setting message priority, such as anchor speaking,audience sending gifts, etc. can be set to [high priority] (https://webim-1252463788.cos.ap-shanghai.myqcloud.com/tweblive/module-TYPES.html#.MSG_PRIORITY_HIGH), like and other unimportant messages can be set to [low priority](https://webim-1252463788.cos.ap-shanghai.myqcloud.com/tweblive/module-TYPES.html#.MSG_PRIORITY_LOW), IM system will ensure that the next high-priority messages issued (Live Room message volume exceeds 40/sec IM background will limit the frequency).

##### 3, for the project to save a lot of development and operation and maintenance costs

- Tencent Cloud Web Live Interactive Component is completely free and open source,its integrated Tencent Cloud web super player is free,only Tencent Cloud instant messaging IM is a value-added service.If your project is in its infancy, you can use the free version of the IM service.Project development is good,when a large number of users, you can buy [IM ultimate] (https://cloud.tencent.com/document/product/269/40267), the price is very beautiful,the lowest in the industry.
- Tencent Cloud instant messaging IM Live large group (AVChatRoom), the number of members of the group is unlimited (This is powerful, let me fork waist).
- Tencent Cloud IM server has a wide node coverage,which can ensure that users can access the nearest, and do not worry about server expansion problems.
- Support security strikes against yellow-related, political-related and indecent words to meet security regulatory needs.
- Tencent Cloud IM service team responds instantly to protect your project.

### What do developers need to do?

##### 1, provide live source, recommended to use [Tencent real-time audio and video TRTC] (https://cloud.tencent.com/document/product/647/16788) of [bypass push flow] (https://cloud.tencent.com/document/product/647/16826)

In order to be compatible with both PC and mobile, developers must also provide FLV and HLS Live source in two formats, in support of MSE browser, live components will prefer to use flv Live Source, lower delay, live better; on the browser does not support MSE, live components will use HLS Live source, delay slightly larger, but in the mobile terminal adaptability.

If you are pushing live streams on Windows or Mac platforms, it is highly recommended to use [TRTC Electron] (https://github.com/tencentyun/TRTCSDK/tree/master/Electron), * * * bypass push flow can generate flv and hls streams at the same time, with Tencent Cloud instant messaging IM perfect combination, stable and reliable, good service, beautiful price***.
[Run through Electron Demo](https://cloud.tencent.com/document/product/647/38548) this document will help you quickly achieve live and bypass push streaming, the effect is as follows：
![](https://user-gold-cdn.xitu.io/2020/5/29/1725f98d5d80e0b0?w=945&h=631&f=gif&s=7387017)

##### 2, Register Tencent Cloud instant messaging IM application

- In [instant messaging IM console](https://console.cloud.tencent.com/avc) sign up for the app and get SDKAppID.
- [Generate UserSig](https://cloud.tencent.com/document/product/269/32688).
- Use [REST API] (https://cloud.tencent.com/document/product/269/1519) to the IM system [import account](https://cloud.tencent.com/document/product/269/1608).
- In [instant messaging IM console](https://console.cloud.tencent.com/avc) or use the REST API [create a live group(AVChatRoom)] (https://cloud.tencent.com/document/product/269/1615)

##### 3, on the basis of Tencent Cloud Web Live Interactive Component, develop related business logic

### Frequently asked questions

##### 1, Enter the live studio, other people see the message and Chat messages are used is 'userID', can support the nickname (nick) display?

If you want to show the nickname into the live studio, you need to set the nickname(you can ignore this step has been set), set successfully and then join
```javascript
// Only logged-in users can modify their nicknames
tweblive.setMyProfile ({nick: "Hu Bayi" }).then(() => {
  tweblive.enterRoom (" " ); / / fill in the studio ID to be added, corresponding to the groupID of the AVCHATROOM of the IM system
});
```

##### 2, when will the component choose to play the flv stream?what are the playback delays for flv and HLS live feeds?

On browsers that support MSE,such as PC Chromium kernel browser (360 speed browser, Chrome browser, etc.), or [TBS] (https://x5.tencent.com/tbs/product/video.html) mode(Android WeChat, QQ browser), the component will prefer to play flv stream.Playback delay comparison：
/ Browser|play delay / 
| --- | ---|
| Windows Chrome|3s~5s / 
| Mac Chrome |3s~5s / 
| Mac Safari |10s~20s / 
| iOS Safari |10s~20s / 
| iOS WeChat |10s~20s / 
| Android WeChat([TBS](https://x5.tencent.com/tbs/product/video.html)) | 3s~5s |
| Android QQ browser |3s~5s / 
| Android Chrome |3s~5s / 
| Android other browsers |10s~20s / 


### Reference documentation

- [Tencent Cloud Web Live Interactive Component API](https://webim-1252463788.cos.ap-shanghai.myqcloud.com/tweblive/TWebLive.html)
- [Tencent real-time audio and video TRTC](https://cloud.tencent.com/document/product/647/16788)
- [TRTC Electron API](https://cloud.tencent.com/document/product/647/38551)
- [Tencent Cloud web super player TcPlayer](https://cloud.tencent.com/document/product/454/7503)
- [Tencent Cloud instant messaging IM] (https://cloud.tencent.com/document/product/269/1498)
- [WebIM API](https://imsdk-1252463788.file.myqcloud.com/IM_DOC/Web/TIM.html)