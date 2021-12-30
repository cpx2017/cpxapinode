var express = require('express')
const apix = require('axios')
const { v4: uuidv4 } = require('uuid');
var FormData = require('form-data');
const sql = require('mysql');
var router = express.Router()
const ik = require("imagekit");
const nodemailer = require("nodemailer");

const imgKitPub = "public_fp431+YLT6pPdDfQg5INTZhoHFs=";
const imgKitPrivate = "private_r5W5xcBGuyqRnREYk8dyudTtNQo=";
const ikEnd = "https://ik.imagekit.io/cpxstorage"
const imgKitPath = "/myportcontact";

router.use(express.urlencoded({extended: true}));
router.use(express.json());

const con = sql.createConnection({
    host: "cpx-mysql.mysql.database.azure.com",
    user: "automate",
    password: "5844277072Cnt",
    database: "myport"
  });

  const ikCon = new ik({
    publicKey : imgKitPub,
    privateKey : imgKitPrivate,
    urlEndpoint : ikEnd
});

async function getSpotAPIKey() {
    const response = await apix({
        url: "https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=AQAqFgPpzsOB_S5iNKT_LPdQD4TBrLzM_VqtWImZD7OZiyZwHJZVmPi3rTBb1R_U6CwSUHedMi6ANKtvjCx5wFsj9X5jZx_8WmoWsL1jbBV1X21sQ1Yfa8vwq4dFEucBkCM",
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic OGVkYWQzMTQ5OGM3NGJkZmJhYTcwZWRhN2NhMzNkNDY6M2YyZTY4ZTJmMTYyNDY1MDhjZGM3YjU5MzQ3ODlmZGY='
          }
    });
    return response.data.access_token;
}

async function LineNoti1(bdy, uid, fle) {
  const txt =  "\nชื่อบริษัทที่ติดต่อ => " + bdy.company +
  "\nที่อยู่อีเมล์ => " + bdy.email +
  "\nหัวข้อ => " + bdy.subject +
  "\nข้อความ => " + bdy.message +
  "\n\nรหัสอ้างอิง => " + uid +
  "\n\nรูปภาพที่แนบมา => " + fle;
  await apix({
      url: "https://notify-api.line.me/api/notify?message=" + encodeURI(txt),
      method: 'post',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer xWbgb55mVGnhmh6iePIfG4OuFWVMkMJsY5DxNeTKQpC'
        }
  });
}

async function UploadImg(imgbase, idbase) {
    let response;
    
     response = await ikCon.upload({
        file : imgbase, //required
        fileName : "myportcon-" + idbase,
        folder: imgKitPath
      })

    return response.url;
}

async function mailSender1(tarmail, lang) {
  let transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "f2d9c20b197d784d17e2ff0d45abd69f", // generated ethereal user
      pass: "c80c37907599381df8f4bb28a569ee9a", // generated ethereal password
    },
  });

  if (lang == 'en') {
    await transporter.sendMail({
      from: '"Chinnathorn\'s MyPort Admin" <no-reply@chinnathornp.ga>', // sender address
      to: tarmail, // list of receivers
      cc: "admin@chinnathornp.ga",
      subject: "[Autoreply System] Confirm received message", // Subject line
      text: "Dear User, " + tarmail + "\n" + "We detect that you send message to myportofficial.chinnathornp.ga with this email address. We're currently receiving your mail and we will reply to you soon. Thank you." + '\n' + '\n' + "_____________________" + '\n' + "Chinnathorn Promnaruritr (chinnathorn.p@gmail.com)", // plain text body
    });
  } else {
    await transporter.sendMail({
      from: '"Chinnathorn\'s MyPort Admin" <no-reply@chinnathornp.ga>', // sender address
      to: tarmail, // list of receivers
      cc: "admin@chinnathornp.ga",
      subject: "[ระบบตอบกลับอัตโนมัติ] ยืนยันการรับข้อความ", // Subject line
      text: "เรียนผู้ใช้งาน " + tarmail + "\n" + "เราพบว่าได้มีการติดต่อมาจากที่อยู่อีเมล์นี้ไปยังผู้พัฒนาเว็บไซต์ myportofficial.chinnathornp.ga เราขอเรียนแจ้งให้ทราบว่า ข้อความได้ถูกส่งไปยังผู้พัฒนาเว็บไซต์นี้แล้ว หากผู้พัฒนาอ่านแล้วจะติดต่อกลับโดยอีเมล์ที่ตามที่แจ้งไว้โดยเร็ว" + '\n' + '\n' + "_____________________" + '\n' + "นายชิณธร พร้อมนฤฤทธิ์ (chinnathorn.p@gmail.com)", // plain text body
    });
  }
}



async function mailSender2(tarmail, client, pass) {
  let transporter = nodemailer.createTransport({
    host: "in-v3.mailjet.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "f2d9c20b197d784d17e2ff0d45abd69f", // generated ethereal user
      pass: "c80c37907599381df8f4bb28a569ee9a", // generated ethereal password
    },
  });

  await transporter.sendMail({
    from: '"MyPort API Assit" <no-reply@chinnathornp.ga>', // sender address
    to: tarmail, // list of receivers
    cc: "admin@chinnathornp.ga",
    subject: "[Autoreply System] Confirm received message", // Subject line
    text: "Dear, " + tarmail + "\nNow you can use MyPort API service with these credential to get access key and enjoy with our API. \nYour Client ID is " + client + ".\nYour Secret Pass is " + pass + "\n Please note that we will block your api key when you intended to spam or hacking our system without prior notice.", // plain text body
  });
}
async function LineNoti2(bdy) {
  const txt =  "ระบบได้ยืนยันสิทธิ์ให้เข้าถึง MyPort API ให้กับ " + bdy.name + " เรียบร้อยแล้ว";
  await apix({
      url: "https://notify-api.line.me/api/notify?message=" + encodeURI(txt),
      method: 'post',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Bearer zbPcg1tvsr7i8QjBro40Tn3BkxMyPBf6CW4TkVuYKDV'
        }
  });
}

router.post('/sendmsg', async function (req, res, next) {
    try {
      const bdy = req.body;
    const guid = uuidv4();
    let imgurl = '';
    if (bdy.img != undefined) {
       imgurl = await UploadImg(bdy.img, guid);
    }
    const query = "INSERT INTO tbl_myportcontact(contact_id, contact_name, contact_company, contact_email, contact_tel, contact_subject, contact_message, contact_reply, contact_lg, contact_img)" 
            + `VALUES('${guid}', '${bdy.name}', '${bdy.company}', '${bdy.email}', '${bdy.tel}', '${bdy.subject}','${bdy.message}', 0, '${bdy.lang}', '${imgurl}')`;
        con.query(query, function (err, result) {
          if (err) throw err;
          console.log('Insert Success');
        });
      
        mailSender1(bdy.email, bdy.lang)
        
      LineNoti1(bdy, guid, imgurl)

    res.json({errorcode: 0})
    } catch (error) {
      res.json({errorcode: error.message})
    }
    
  })

  router.post('/getapi', async function (req, res, next) {
    try {
      const bdy = req.query;
    const sepass = uuidv4();
    const seclient = Buffer.from(sepass).toString('base64')

    const query = "INSERT INTO tbl_myportapi(clientID, api_name, api_email, secreatpass, api_accesskey, api_accessvalid)" 
            + `VALUES('${seclient}', '${bdy.name}', '${bdy.email}', '${sepass}', '',CONVERT_TZ(NOW(), 'SYSTEM', '+07:00'))`;
        con.query(query, function (err, result) {
          if (err) throw err;
          console.log('Insert Success');
        });
      
        mailSender2(bdy.email, seclient, sepass)
        
      LineNoti2(bdy)

    res.json({id: seclient, email: bdy.email})
    } catch (error) {
      next({msg: error.message})
    }
    
  })

router.get('/', async function (req, res, next) {
    // const resp = await getSpotAPIKey();
    res.json({msg: 'OK'})
  })

  module.exports = router;