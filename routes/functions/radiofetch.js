const sql = require('mysql');
const apix = require('axios')

const con = sql.createConnection({
    host: "cpx-mysql.mysql.database.azure.com",
    user: "automate",
    password: "5844277072Cnt",
    database: "radioth"
  });

async function artworkurlbyspot(name, art) {
    let n1, n2;
    n1 = name.replace(" \(.*?\)", "").replace(" / ", " ");
    n2 = art.replace(" \(.*?\)", "")
    const index = n2.lastIndexOf(" - ");
    if (index > 0) 
        n2 = n2.substring(0, index);
    const ref = await apix({
        url: "https://accounts.spotify.com/api/token?grant_type=refresh_token&refresh_token=AQAqFgPpzsOB_S5iNKT_LPdQD4TBrLzM_VqtWImZD7OZiyZwHJZVmPi3rTBb1R_U6CwSUHedMi6ANKtvjCx5wFsj9X5jZx_8WmoWsL1jbBV1X21sQ1Yfa8vwq4dFEucBkCM",
        method: 'post',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic OGVkYWQzMTQ5OGM3NGJkZmJhYTcwZWRhN2NhMzNkNDY6M2YyZTY4ZTJmMTYyNDY1MDhjZGM3YjU5MzQ3ODlmZGY='
          }
    });
    const response = await apix({
        url: "https://api.spotify.com/v1/search?q=" + encodeURI(n1) + "+" + encodeURI(n2) + "&type=track&market=th&limit=1",
        method: 'get',
        headers: {
            'Authorization': 'Bearer ' + ref.data.access_token
          }
    });
    if (response.data.tracks.items.length == 0) {
        return {
            src: "",
            link: ""
        }
    } else {
        return {
            src: response.data.tracks.items[0].album.images[0].url,
            link: response.data.tracks.items[0].album.external_urls.spotify
        }
    }
}

async function artworkurlbyitune(name, art) {
    let n1, n2;
    n1 = name.replace(" \(.*?\)", "").replace(" / ", " ");
    n2 = art.replace(" \(.*?\)", "")
    const index = n2.lastIndexOf(" - ");
    if (index > 0) 
        n2 = n2.substring(0, index);
    const response = await apix({
        url: "https://itunes.apple.com/search?term=" + encodeURI(n1) + "+" + encodeURI(n2) + "&limit=1&country=th",
        method: 'get'
    });
    if (response.data.results.length == 0) {
        return ""
    } else {
        return response.data.results[0].trackViewUrl
    }
}

async function artworkurlbyjoox(name, art) {
    let n1, n2;
    n1 = name.replace(" \(.*?\)", "").replace(" / ", " ");
    n2 = art.replace(" \(.*?\)", "")
    const index = n2.lastIndexOf(" - ");
    if (index > 0) 
        n2 = n2.substring(0, index);
    const response = await apix({
        url: "https://api-jooxtt.sanook.com/openjoox/v3/search?country=th&keyword=" + encodeURI(n1) + "+" + encodeURI(n2),
        method: 'get'
    });
    if (response.data.section_list.length == 0) {
        return {
            src: "",
            link: ""
        }
    } else {
        if (response.data.section_list[0].section_title == "Tracks") {
            return {
                src: response.data.section_list[0].item_list[0].song[0].song_info.images[0].url,
                link: "https://www.joox.com/th/album/" + response.data.section_list[0].item_list[0].song[0].song_info.album_id
            }
        } else {
            return {
                src: "",
                link: ""
            }
        }
    }
}

async function ShowArt(art) {
    let n1;
    n1 = art.replace(" \(.*?\)", "").replace(" / ", " ");
    n1 = n1.replace(" [+] ", ", ")
    const index = n1.lastIndexOf(" - ");
    if (index > 0) 
        n1 = n1.substring(0, index);
    return n1
}

async function syncLike(name,art) {
    let res
    const resp = await con.query("SELECT count from likerecord where MATCH(title) AGAINST(\"" + name + "\") and MATCH(artist) AGAINST(\"" + art + "\")", function (err, result, fields) {
    return result
  });
  if (resp.length > 0) {
        res = (resp[0].count)
    } else {
        res = (0)
    }
  return res
}

module.exports = {
    Coolism : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://coolism-web.cdn.byteark.com/;stream/1"}
        } else {
            const response = await apix({
                url: "https://www.coolism.net/radio/api_song.php",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Cool Fahrenheit 93 (Coolism)";
            temp.radioshort = "Coolism";
            if (res.data.nowsong.song == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.nowsong.song
            }

            if (res.data.nowsong.artist == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.nowsong.artist;
                if (temp.artist.includes("[+]"))
                    temp.artist = temp.artist.replace(" [+] ", ", ");
            }
            if (res.data.nowsong.artist == "COOLfahrenheit")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.coolj_time;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            // const img = await artworkurlbyspot("สวัฒฯ", "ไทยแลย ข่ากาส");
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.coolj_nickname + " | " + res.data.coolj_fullname;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    HitzDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://24863.live.streamtheworld.com/HITZ_955AAC.aac"}
        } else {
            const response = await apix({
                url: "https://service.teroradio.com/web_service/nowplaying/show/1/?jsonp=1",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Tero Radio HITZ 955";
            temp.radioshort = "HITZ955";
            if (res.now_song == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.now_song
            }

            if (res.now_artist == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.now_artist;
            }
            if (temp.artist.includes("DJ") && temp.title.includes("HITZ"))
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.show_name + " | " + res.show_time;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                temp.art = "unknown";
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.dj_name;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    EazyDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://24863.live.streamtheworld.com/EAZYFM_1055AAC.aac"}
        } else {
            const response = await apix({
                url: "https://service.teroradio.com/web_service/nowplaying/show/2/?jsonp=1",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Tero Radio Eazy FM 105.5";
            temp.radioshort = "Eazy FM";
            if (res.now_song == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.now_song
            }

            if (res.now_artist == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.now_artist;
            }
            if (temp.artist == "Eazy FM 105.5")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.show_name + " | " + res.show_time;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.dj_name;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    ChillDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/chill"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/3",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Chill Online";
            temp.radioshort = "chillonline";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    EFMDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/efm"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/4",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "EFM Station";
            temp.radioshort = "efm";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    GreenDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/green"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/5",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Green Wave";
            temp.radioshort = "green";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    WhitePopDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/whitepop"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/6",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Atimeonline White Pop";
            temp.radioshort = "whitepop";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    HotWaveDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/hotwave"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/9",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Atimeonline Hot Wave";
            temp.radioshort = "hotwave";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    },
    CassetteDetail : async function (streamonly) {
        let res;
        let temp = {};
        if (streamonly == true) {
            res = {link: "https://atimeonline.smartclick.co.th/cassette"}
        } else {
            const response = await apix({
                url: "https://graph.atimeonline.com/v5.5/playing/10",
                method: 'get'
            });
            res =  response.data
            temp.radioname = "Atimeonline Cassette";
            temp.radioshort = "hotwave";
            if (res.data.audio.title == "") {
                temp.title = "ไม่ทราบชื่อเพลง (รอสัญญาณจากทางสถานี)"
            } else {
                temp.title = res.data.audio.title
            }

            if (res.data.audio.description == "")
            {
                temp.artist = "ไม่ทราบชื่อศิลปิน (รอสัญญาณจากทางสถานี)";
            }
            else
            {
                temp.artist = res.data.audio.description;
            }
            if (res.data.audio.description == "")
            {
                temp.onLike = false;
            }else
            {
                temp.onLike = true;
            }
            temp.showtime = res.data.dj.description;
            const img = await artworkurlbyspot(temp.title, temp.artist);
            const img2 = await artworkurlbyitune(temp.title, temp.artist);
            const img3 = await artworkurlbyjoox(temp.title, temp.artist);
            if (img.src == "") {
                if (img3.src == "") {
                    temp.img = "https://cdn.jsdelivr.net/gh/cpx2017/cpxcdnbucket@latest/radioth/favicon.png"
                    temp.art = "unknown";
                } else {
                    temp.img = img3.src
                    temp.art = img3.link;
                }
            } else {
                temp.img = img.src
                temp.art = img.link;
            }
            
            if (img2 == "") {
                temp.art2 = "unknown"
            } else {
                temp.art2 = img2
            }
            if (img3.src == "") {
                temp.art3 = "unknown";
            } else {
                temp.art3 = img3.link;
            }
            temp.artShort = await ShowArt(temp.artist)
            temp.djname = res.data.dj.title;
            temp.countliked = await syncLike(temp.title, temp.artist)
            res = temp;
        }
        
        return res
    }
}