import e = require("express");
import {func} from "joi";
/**
 * Created by NamTV on 5/25/2017.
 */
var fs = require('fs');
var request = require('request');
var setCookie = require('set-cookie-parser');
var cheerio = require('cheerio');
class GoogleDriveGeterDMCA {
    private headers: any = {
        'authority': 'drive.google.com',
        'method': 'GET',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'scheme': 'https',
        'accept-language': 'en-US,en;q=0.8',
        'upgrade-insecure-requests': '1',
        'accept-encoding': 'deflate',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.4.3029.130 Safari/537.36',
        'connection': 'keep-alive'
    };
    private cookies;
    private fileId;
    private urlDownload;

    constructor(fileId,domain,cookies) {
        this.cookies = cookies;
        this.urlDownload = 'https://drive.google.com/a/'+domain+'/uc?id=' + fileId + '&export=download';
        this.fileId = fileId;
    }

    private getStringCookie(cookies_stored) {
        var string_cookies = '';
        for (var i = 0; i < cookies_stored.length; i++) {
            string_cookies += cookies_stored[i].name + '=' + cookies_stored[i].value + ';';
        }
        return string_cookies;
    }

    private reAsignCookie(name, value) {
        for (var i = 0; i < this.cookies.length; i++) {
            if (this.cookies[i].name == name) {
                this.cookies[i].value = value;
                return;
            }
        }
    }

    private removeCookieByName(name) {
        for (var i = 0; i < this.cookies.length; i++) {
            var obj = this.cookies[i];
            if (obj.name == name) {
                this.cookies.splice(i, 1);
                return;
            }
        }
    }

    private addCookie(cookie) {
        var exist = false;
        for (var i = 0; i < this.cookies.length; i++) {
            var obj = this.cookies[i];
            if (obj.name == cookie.name) {
                for (var g in cookie) {
                    obj[g] = cookie[g];
                }
                //cookies_stored.splice(i, 1);
                exist = true;
                break;
            }
        }
        if (!exist) {
            var obj = this.cookies[0];
            for (var g in cookie) {
                obj[g] = cookie[g];
            }
            this.cookies.push(cookie);
        }
    }

    private changeCookie(setCookie) {
        for (var i = 0; i < setCookie.length; i++) {
            var obj = setCookie[i];
            if (obj.value == 'deleted') {
                this.removeCookieByName(obj.name);
            } else {
                this.addCookie(obj);
            }
        }
    }

    public download(url,out,callback) {
        this.headers['cookie'] = this.getStringCookie(this.cookies);

        var options = {
            url: url,
            method: 'GET',
            headers: this.headers,
            followRedirect: false
        };

        request(options)
            .on('response', function (response) {
                // console.log(response.statusCode) // 200
                // console.log(response.headers['content-type']) // 'image/png'

            })
            .on('end', function () {
                callback(null,out);
            })
            .on('error', function (err) {
                callback(err);
            }).pipe(fs.createWriteStream('video.mp4'));
    }

    private doGet(url, callback) {
        // console.log('do get: ',url);
        this.headers['cookie'] = this.getStringCookie(this.cookies);

        var options = {
            url: url,
            method: 'GET',
            headers: this.headers,
            followRedirect: false
        };

        request(options, (err, res, body) => {
            if(!err){
                var cookies = setCookie.parse(res);
                this.changeCookie(cookies);
            }
            callback(err, res, body);
        });
    }

    public getLinkDownloadBeMoved(nextUrl) {
        return new Promise((resolve, reject) => {
            this.doGet(nextUrl, (err, res, body) => {
                if (!err) {
                    var $ = cheerio.load(body);
                    var href = ($('#uc-download-link').attr('href'));
                    var nextURL = 'https://drive.google.com' + href;
                    // console.log(nextURL);
                    this.doGet(nextURL, (err, res, body) => {
                        // console.log(err)
                        // console.log(res.headers);
                        var urlDownload = (res.headers.location);
                        this.doGet(urlDownload, (err, res, body) => {
                            // console.log(res.headers);
                            var urlDownload = (res.headers.location);
                            this.doGet(urlDownload, (err, res, body) => {
                                // console.log(res.headers);
                                var urlDownload = (res.headers.location);
                                resolve(urlDownload);
                            });
                        });
                    });
                } else {
                    reject(err);
                }

            })
        })
    }

    public getLinkDownload() {
        return new Promise((resolve, reject) => {
            this.doGet(this.urlDownload, (err, res, body) => {
                // console.log(err);
                if (!err) {
                    var $ = cheerio.load(body);
                    var nextURL = ($('#uc-download-link').attr('href'));
                    var isMoved = false;
                    if (!nextURL) {
                        if ($('title').text() == 'Moved Temporarily') {
                            nextURL = $('a').attr('href');
                            isMoved = true;
                        }
                    }else{
                        nextURL = 'https://drive.google.com'+nextURL;
                    }
                    // console.log(nextURL,isMoved);
                    if (isMoved) {
                        return this.getLinkDownloadBeMoved(nextURL).then(resolve).catch(reject);
                    }
                    if(!nextURL){
                        if($('title').text().indexOf('403') >= 0){
                            console.log('Khong co quyen truy cap');
                           return resolve(null);
                        }else{
                            console.log('File bị DMCA hoặc không tồn tại');
                            return resolve(null);
                        }
                    }
                    this.doGet(nextURL, (err, res, body) => {
                        // console.log(err)
                        // console.log(res.headers);
                        var urlDownload = (res.headers.location);
                        this.doGet(urlDownload, (err, res, body) => {
                            // console.log(res.headers);
                            var urlDownload = (res.headers.location);
                            this.doGet(urlDownload, (err, res, body) => {
                                // console.log(res.headers);
                                var urlDownload = (res.headers.location);
                                resolve(urlDownload);
                            });
                        });
                    });

                } else {
                    reject(err);
                }

            });
        })

    }
}
/*
* Xong loai file private
* Xong loai file public
* Xong loai file DCMA
* */

// new GoogleDriveGeterDMCA('0B5Gx36Ci16PFMHI5SGRIT3JYTUU').getLinkDownload().then((url) => {  //DMCA
// new GoogleDriveGeterDMCA('0B5Lo3-LLgp9UdHFDWTNldFowMFU').getLinkDownload().then((url) => {  //Public
var cookies1 = [
    {
        "domain": ".drive.google.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "DRIVE_STREAM",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": "0",
        "value": "XQ2lA9jnrS8",
        "id": 1
    },
    {
        "domain": ".google.com",
        "expirationDate": 1562214180,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "PvasNWMQhvc9vT_1/A_1U5Me8Zgp8V6CMQ",
        "id": 2
    },
    {
        "domain": ".google.com",
        "expirationDate": 1562214180,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "A6Nms1eaUHyKKLXp0",
        "id": 3
    },
    {
        "domain": ".google.com",
        "expirationDate": 1514953440,
        "hostOnly": false,
        "httpOnly": true,
        "name": "NID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "107=FK08dzNAdI6tPSwOKSxKkCHkPC4dQWUpnmLZJOf1S-yWdMMjNDOqM7NggkBbOeJTL7Q9nZ2obaG1pm0kJMpJQ5jrzjCAr2tGYCN4J0dH5A3GjHvqHuqV7Me9JZZScPC9YGefD66pGnvTJ9V25BDxP1N_6mw9go4AQoaiRoxuN_zgDKE",
        "id": 4
    },
    {
        "domain": ".google.com",
        "expirationDate": 1562214180,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "0TfXaan4W278GGRD/An6XSToQRaDJyeA18",
        "id": 5
    },
    {
        "domain": ".google.com",
        "expirationDate": 1562214180,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "4QTGRe-IbTezjE_SfPnXISVEREdNiHUsxhE_63ZqZ31pH7bqDuLjaHQS4LAssw8vqsZ2nA.",
        "id": 6
    },
    {
        "domain": ".google.com",
        "expirationDate": 1562214180,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "A7Ht4tkt76YIqVr5B",
        "id": 7
    },
    {
        "domain": "drive.google.com",
        "hostOnly": true,
        "httpOnly": true,
        "name": "S",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": "0",
        "value": "explorer=yhrzlWYlvOzLNsK8sXqpYc2tRrHSuKlj",
        "id": 8
    }
];  // cookie dmca account giaodich1688online.com
var cookies = [
    {
        "domain": ".drive.google.com",
        "hostOnly": false,
        "httpOnly": true,
        "name": "DRIVE_STREAM",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": "0",
        "value": "ftYpMcr_ZM0",
        "id": 1
    },
    {
        "domain": ".google.com",
        "expirationDate": 1549699397,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__utma",
        "path": "/drive/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "173272373.784278126.1486627396.1486627396.1486627396.1",
        "id": 2
    },
    {
        "domain": ".google.com",
        "expirationDate": 1502395397,
        "hostOnly": false,
        "httpOnly": false,
        "name": "__utmz",
        "path": "/drive/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "173272373.1486627396.1.1.utmcsr=(direct)|utmccn=(direct)|utmcmd=(none)",
        "id": 3
    },
    {
        "domain": ".google.com",
        "expirationDate": 1561804363.009862,
        "hostOnly": false,
        "httpOnly": false,
        "name": "APISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "_uFekVB6jBn7mMOX/ALwkw1UHpszeKq3Xc",
        "id": 4
    },
    {
        "domain": ".google.com",
        "expirationDate": 1561804363.00982,
        "hostOnly": false,
        "httpOnly": true,
        "name": "HSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "AocveHqX4YB3_3_Js",
        "id": 5
    },
    {
        "domain": ".google.com",
        "expirationDate": 1514960168.758734,
        "hostOnly": false,
        "httpOnly": true,
        "name": "NID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "107=pBACnYT1CA6yhA60WERHij7o-0mbvl9Tqo1BOoSd_f-nhw0xG4ezWB6NCBQquGkaVhFY_iQwWy8xCWbY_CrIfMswyAgTzNAehwQplMq3KYyCYSKU2CKo8iC86ibVhitCP_XsXBXZTPsS0EoWFEMJtqm5L468jceUnOSnarAVS8tRB2ddVKPv__iahJcGGMEJDo2gMis4VtcHsUoiRjJZa5fCNCBNgX-_awCR7M_NPDwshdYDvKLU7FW_a09gDC0dfrkBZLRunFepoqtaqkwFXEdudCidslQMvjHkkOcLYcyw9EKk48hQZkakH4fdRxN3FMMrX91YXt43ayfAcJ_6ld_uCHKlmid35_QE8a-q8qWOe59ecRjy3EMUwvhuSjANAN69xy_aGQxgS32RCNmtY2rv0onISTiKXl7R9uM9GagprItL7reO6S-26XAJfR2wYI--heSHqs7QBmZ2aCwfShsjkC6qZ07G8U4RxhRq8EqldyST5NkSz5q_Fa46PX9Di_zOYAZcXE85pHIetRZGjxkmdxtnAExzTSbvNieXhofEQYQk-5Jm8xW7s_Tq",
        "id": 6
    },
    {
        "domain": ".google.com",
        "expirationDate": 1561804363.009884,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SAPISID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "0USfhuvXEIu4zMLV/AGQ3zB_kOtzScJ54b",
        "id": 7
    },
    {
        "domain": ".google.com",
        "expirationDate": 1561857517.371454,
        "hostOnly": false,
        "httpOnly": false,
        "name": "SID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": false,
        "session": false,
        "storeId": "0",
        "value": "3QQ4UZbo23_JiL6tg0dg0mPDLx6eyoUGVA0DNH24BkAhd9B0Tw87JpTit4afOVULhwHrjg.",
        "id": 8
    },
    {
        "domain": ".google.com",
        "expirationDate": 1561804363.009842,
        "hostOnly": false,
        "httpOnly": true,
        "name": "SSID",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": false,
        "storeId": "0",
        "value": "AM3iO4ys_5ueEXkBP",
        "id": 9
    },
    {
        "domain": "drive.google.com",
        "hostOnly": true,
        "httpOnly": true,
        "name": "S",
        "path": "/",
        "sameSite": "no_restriction",
        "secure": true,
        "session": true,
        "storeId": "0",
        "value": "explorer=2vxZiGFdQ-ByGre5ZlFboHtijxBc2VsP",
        "id": 10
    }
];  // cookie namtv    sandinh.net
// new GoogleDriveGeterDMCA('0B34_zS68K1FGMml5cXFyUkl5ajQ','sandinh.net',cookies).getLinkDownload().then((url) => {     //Private
// new GoogleDriveGeterDMCA('0B5Lo3-LLgp9UdHFDWTNldFowMFU','giaodich1688online.com',cookies1).getLinkDownload().then((url) => {     //Public
// var gdGetter = new GoogleDriveGeterDMCA('0B5Gx36Ci16PFMHI5SGRIT3JYTUU','giaodich1688online.com',cookies1);
// gdGetter.getLinkDownload().then((url) => {     //Public
//     if(url){
//         console.log(url);
//         gdGetter.download(url,function () {
//
//         });
//     }
// });

export = GoogleDriveGeterDMCA;