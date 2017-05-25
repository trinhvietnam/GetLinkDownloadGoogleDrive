import {GoogleDriveGeter} from "../models/GoogleDriveGeter";
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {

    var fileId = req.query['fileId'];
    console.log('11111111111111111111', fileId);
    var googleDriveGetter = new GoogleDriveGeter(fileId);
    googleDriveGetter.getLinkDownload()
        .then((url) => {
            res.json([{"quantity": "1070p", "link": url}]);
        })
        .catch(() => {
            res.json([]);
        })
});

module.exports = router;
