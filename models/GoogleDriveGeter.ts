/**
 * Created by NamTV on 5/25/2017.
 */
var fs = require('fs');
var request = require('request');
var setCookie = require('set-cookie-parser');
var cheerio = require('cheerio');
export class GoogleDriveGeter {
    private headers: any = {
        'authority': 'drive.google.com',
        'method': 'GET',
        'scheme': 'https',
        'user-agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.3.2743.138 Safari/537.36'
    };
    private cookies = [
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
            "value": "3eMfE7iVi44",
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
            "expirationDate": 1558758268.505931,
            "hostOnly": false,
            "httpOnly": false,
            "name": "APISID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "JNcmkBoHc-_LSxkk/AhiLCMDdlOJMJ627O",
            "id": 4
        },
        {
            "domain": ".google.com",
            "expirationDate": 1558758268.505736,
            "hostOnly": false,
            "httpOnly": true,
            "name": "HSID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "Ayn5uYruEo1-hRHRz",
            "id": 5
        },
        {
            "domain": ".google.com",
            "expirationDate": 1511497468.506274,
            "hostOnly": false,
            "httpOnly": true,
            "name": "NID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "104=o5WjAEkFxZ_rsMq2fHEKwXlFT3iNM-KTuhuA64RbwCuQfdf6P5Q6Dhd7l4RiVfLKPfO7--q4IDVvEpNSBFmtNLKuZNopOTkzhbI-KH9DAyWIPCDUkWUJ-7fTO0pWBeXaJU-N5BMRb2fupNNHPUK5aluHZXVFniPfpCuu5DSeUyp_DyCNkNnWHYgk_1n3Yi4qGKi2WTUl97YRPX8wt32H8zk3njXkNQlZNgM0I3Jl7_pCJCfS3BvhLZArUKrEqnwMFbJWFZ0vWNaiC9GRLlvNnBt5H8a7nBROLrJNYhTMre9Jzg_bP35QB2F_Qtmw05jPZlQwpa7iGjJtoB2ffWCxw5N1uk4kRAuax2xhPYJXkbLZWa59Z7EmPQUgwY8NBcSJt35rYVRZf5Fij5SWw62Z4wRA5FmueQ_ol8Gz9i-K",
            "id": 6
        },
        {
            "domain": ".google.com",
            "hostOnly": false,
            "httpOnly": true,
            "name": "S",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": true,
            "storeId": "0",
            "value": "billing-ui-v3=3N3X1rcz2pUomo_cdYNZCahdhxNrWDoQ:billing-ui-v3-efe=3N3X1rcz2pUomo_cdYNZCahdhxNrWDoQ",
            "id": 7
        },
        {
            "domain": ".google.com",
            "expirationDate": 1558758268.506035,
            "hostOnly": false,
            "httpOnly": false,
            "name": "SAPISID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "P3Hk91dKVSQAPn7n/A-_VcFkUQH3XXZIku",
            "id": 8
        },
        {
            "domain": ".google.com",
            "expirationDate": 1558758268.505496,
            "hostOnly": false,
            "httpOnly": false,
            "name": "SID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": false,
            "session": false,
            "storeId": "0",
            "value": "uQQ4Ufus3CUxinhqOeCL6ZpUezGTyKDc1QdGS8d-jfOeZZBAHpcB7FC5PLkURndAUkZ40Q.",
            "id": 9
        },
        {
            "domain": ".google.com",
            "expirationDate": 1558758268.505833,
            "hostOnly": false,
            "httpOnly": true,
            "name": "SSID",
            "path": "/",
            "sameSite": "no_restriction",
            "secure": true,
            "session": false,
            "storeId": "0",
            "value": "AQWel5IzGo23v25eW",
            "id": 10
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
            "value": "billing-ui-v3=3N3X1rcz2pUomo_cdYNZCahdhxNrWDoQ:billing-ui-v3-efe=3N3X1rcz2pUomo_cdYNZCahdhxNrWDoQ:explorer=jkzgnrOcajjGxrFgHp4W8-OC77Upl2FD",
            "id": 11
        }
    ];
    private fileId;
    private urlDownload;

    constructor(fileId) {
        this.urlDownload = 'https://drive.google.com/uc?id=' + fileId + '&export=download';
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

    private doGet(url, callback) {
        this.headers['cookie'] = this.getStringCookie(this.cookies);

        var options = {
            url: url,
            method: 'GET',
            headers: this.headers,
            followRedirect :false
        };

        request(options, (err, res, body) => {
            callback(err, res, body);
        });
    }

    public getLinkDownload() {
        return new Promise((resolve,reject)=>{
            this.doGet(this.urlDownload, (err, res, body) => {
                console.log(err);
                if (!err) {
                    var $ = cheerio.load(body);
                    var nextURL = 'https://drive.google.com' + ($('.goog-inline-block.jfk-button.jfk-button-action').attr('href'));
                    var cookies = setCookie.parse(res);
                    this.changeCookie(cookies);
                    this.doGet(nextURL,(err, res, body) => {
                        if(!err){
                            var urlDownload = (res.headers.location).replace('?e=download','');
                            resolve(urlDownload);
                        }else{
                            reject(err);
                        }

                    })
                } else {
                    reject(err);
                }

            });
        })

    }
}
// new GoogleDriveGeter('0BzKbAdblr0l7RWhLUHJGak4xT3M').getLinkDownload().then((url)=>{
//     console.log(url);
// });