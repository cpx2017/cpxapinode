var express = require('express')
const apix = require('axios')
const { v4: uuidv4 } = require('uuid');
var FormData = require('form-data');
const sql = require('mysql');
var router = express.Router()
const ik = require("imagekit");
const nodemailer = require("nodemailer");

const radioFunc = require('../functions/radiofetch');
const { Coolism, HitzDetail, EazyDetail, ChillDetail, EFMDetail, GreenDetail, WhitePopDetail, HotWaveDetail, CassetteDetail } = radioFunc

router.post('/getjsonapi', async function (req, res, next) {
    const radioch = req.query.station;
    switch (radioch) {
        case "cool":
            res.json(await Coolism(true));
            break;
        case "hitz":
            res.json(await HitzDetail(true));
            break;
        case "eazy":
            res.json(await EazyDetail(true));
            break;
        case "chill":
            res.json(await ChillDetail(true));
            break;
        case "efm":
            res.json(await EFMDetail(true));
            break;
        case "green":
            res.json(await GreenDetail(true));
            break;
        case "wp":
            res.json(await WhitePopDetail(true));
            break;
        case "hw":
            res.json(await HotWaveDetail(true));
            break;
        case "cs":
            res.json(await CassetteDetail(true));
            break;
        default:
            res.status(400);
            res.json({"msg": "Not found"})
            break;
    }
})

router.post('/apiloop', async function (req, res, next) {
    const radioch = req.query.station;
    switch (radioch) {
        case "cool":
            res.json(await Coolism(false));
            break;
        case "hitz":
            res.json(await HitzDetail(false));
            break;
        case "eazy":
            res.json(await EazyDetail(false));
            break;
        case "chill":
            res.json(await ChillDetail(false));
            break;
        case "efm":
            res.json(await EFMDetail(false));
            break;
        case "green":
            res.json(await GreenDetail(false));
            break;
        case "wp":
            res.json(await WhitePopDetail(false));
            break;
        case "hw":
            res.json(await HotWaveDetail(false));
            break;
        case "cs":
            res.json(await CassetteDetail(false));
            break;
        default:
            res.status(400);
            res.json({"msg": "Not found"})
            break;
    }
})

module.exports = router;