const surveycakeURL = 'https://www.surveycake.com/'
const sendDataURL = 'https://www.TEST.com/POST/API'
const debbugMode = 1 //1開啟, 0關閉debug
const debbugPack = 2 // 0-2 設定題組

//頁面紀錄 從localStorage取得deegooq_current_page的頁面資料
let currentPage = 'start'
/*
let collectData ={}
if(window.localStorage.getItem('deegooq_current_page')){
    currentPage = window.localStorage.getItem('deegooq_current_page')
    console.log('deegooq_current_page', currentPage)
}
*/

if (debbugMode) {
    currentPage = 'Q1-start'
}
//主要資料物件
let mainData = {}

//使用者資料 從localStorage取得deegooq_current_page的頁面資料
/*
if(window.localStorage.getItem('deegooq_current_data') && currentPage != 'start'){
    collectData =JSON.parse( window.localStorage.getItem('deegooq_current_data'))
}
*/

//#region 讀取圖片資源管理
const loadImgManager = (forder, items = [], allComplete = () => {}) => {
    const assetsList = items
    let ct = 0
    const loadImgAssets = url => {
        const img = new Image()
        img.src = url
        img.onload = () => {
            //console.log(`image ${assetsList[ct]} load complete`)
            ct++
            if (ct < assetsList.length) {
                loadImgAssets(`./${forder}/${assetsList[ct]}`)
            } else {
                //console.log('load all img complete')
                allComplete()
                //document.querySelector(".loading").classList.add('off')
            }
        }
    }
    loadImgAssets(`./${forder}/${assetsList[ct]}`)
}
//#endregion

//#region  防止double tap 測試
window.onload = () => {
    document.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    }, {
        passive: false
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}
//#endregion

document.addEventListener('DOMContentLoaded', () => {
    //#region 偵測頁面方向
    const detectOrientation = () => {
        //console.log(window.orientation )
        if (window.orientation == 90 || window.orientation == -90) {
            document.querySelector(".app.landscape").style.display = 'flex'
            document.querySelector(".app.portrait").style.display = 'none'
        } else {
            document.querySelector(".app.landscape").style.display = 'none'
            document.querySelector(".app.portrait").style.display = 'flex'
        }
    }

    window.addEventListener('resize', detectOrientation)
    detectOrientation()
    //#endregion 

    //#region 頁面控制 套院pageBtn按鈕配合取得datasets中的ID資料即可切換頁面
    const pages = document.querySelectorAll(".page")
    const btns = document.querySelectorAll(".pageBtn")

    //關閉所有頁面
    const closeAll = () => {
        pages.forEach(page => {
            page.style.display = "none"
        })
    }

    const openPage = pageID => {
        closeAll()
        //window.localStorage.setItem('deegooq_current_page', pageID.replace('#',''))//設定當前頁面
        document.querySelector(pageID).style.display = "flex"
    }

    const stayPage = pageID => {
        console.log('stay page', pageID)
        window.localStorage.setItem('deegooq_current_page', pageID) //紀錄使用者最後停留的頁面
    }

    //將所有的pageBtn設定click後的行為
    const setBtnsHandler = () => {
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                const pageID = event.currentTarget.dataset.id
                //window.localStorage.setItem('deegooq_current_page', pageID)//設定當前頁面
                if (event.currentTarget.dataset.stay) {
                    stayPage(event.currentTarget.dataset.stay)
                }
                openPage(`#${pageID}`)
            })
        })
    }
    //#endregion

    //#region 資料收集器 data collector
    const setDataCollector = (key, value) => {
        collectData = {
            ...collectData,
            [key]: value
        }
        window.localStorage.setItem('deegooq_current_data', JSON.stringify(collectData))
        console.log(collectData)
    }
    //#endregion

    //#region 進入結束步驟後取得作答資料
    const sendData = () => {
        console.log("結束-取得作答資料", collectData)
    }
    //#endregion

    //#region 個人資料的button group
    const setButtonGroup = () => {
        document.querySelectorAll(".button-group").forEach(btn => {
            btn.addEventListener("click", event => {
                const _t = event.currentTarget
                const _g = _t.dataset.group
                const _v = _t.dataset.value
                document.querySelectorAll(`.button-group[data-group=${_g}]`).forEach(gBtn => {
                    gBtn.classList.remove('on')
                })
                _t.classList.add('on')
                setDataCollector(_g, _v)
            })
        })
    }
    //#endregion

    document.querySelector("#goSurveycake").addEventListener('click', () => {
        //window.localStorage.setItem('deegooq_current_page', 'start')//設定當前頁面
        stayPage('start')
        setTimeout(() => {
            window.open(surveycakeURL, '_self')
        }, 100);
    })

    //#region 計時器元件
    const setTimer = (ct, VID, endF) => {
        let _ct = ct
        const timer = setInterval(() => {
            //console.log(`${VID} timer count left ${_ct}`)
            _ct--
            document.querySelector(VID).innerHTML = _ct
            if (_ct == 0) {
                endF()
            }
        }, 1000);

        return timer

    }
    //#endregion

    //#region personal個資同意書 
    const personal = () => {
        document.querySelector('#isAgree').addEventListener('click', event => {

            event.target.checked ?
                document.querySelector('#sendArgee').classList.remove('off') :
                document.querySelector('#sendArgee').classList.add('off')
        })
    }
    //#endregion

    //#region 語音播放元件
    const soundPlayer = (btnID, barID, soundPath, complete) => {
        let sw = true;
        let _progress
        if (barID) {
            _progress = document.querySelector(barID)
        }
        document.querySelector(btnID).addEventListener("click", event => {
            if (!sw) return
            sw = false
            event.currentTarget.classList.add("mute")
            let mp3 = new Audio()
            mp3.src = soundPath
            mp3.play()
            mp3.addEventListener('ended', () => {
                complete()
            })
            if (_progress) {
                mp3.addEventListener('timeupdate', () => {
                    _progress.style.width = `${Math.floor((mp3.currentTime/mp3.duration)*100)}%`
                })
            }
        })
    }
    //#endregion

    //#region list題庫列表    
    const setList = data => {
        const box = document.querySelector('#listBox')
        data.list.map((row, index) => {
            const btn = document.createElement('button')
            btn.innerHTML = row.title
            btn.dataset.sn = index
            btn.addEventListener('click', event => {
                mainData = data.list[event.target.dataset.sn]
                /*
                q1()
                q2()
                q3()
                q4()
                q5ex()
                q6()
                q7()
                openPage('#Q1-1')
                stayPage('Q1-1')
                */
                setDataCollector('pack', row.title)
                window.localStorage.setItem('packNum', event.target.dataset.sn)
            })
            box.appendChild(btn)
        })
    }
    //#endregion

    //#region QPlayer 播放器題型
    const QPlayer = (data) => {
        const _d = data || {}
        if (_d.questID  && _d.soundSource && _d.nextPage) {
            soundPlayer(
                _d.questID+"-start .playMp3Btn",
                _d.questID+"-start .Qprogress .bar",
                _d.soundSource,
                () => {
                    setTimeout(() => {
                        openPage(_d.nextPage.length > 0 ? _d.nextPage[0] : _d.nextPage)
                    }, (_d.nextDelay ? _d.nextDelay : 1000))
                }
            )
        }
    }
    //#endregion

    //#region 分解圖形的問答題型
    const QShapeSeperate = (data) => {
        const _d = data || {}
        if (_d.nextPage) {
            const skipBtn = document.querySelector(_d.questID + "-end .skip")
            if (skipBtn) {
                skipBtn.addEventListener("click", () => {
                    openPage(_d.nextPage)
                })
            }
        }
        if (_d.imgB) {
            const ansBox = document.querySelector(_d.questID + "-end div.ansBox")
            const total = 5
            let myAns;
            for (let i = 1; i <= total; i++) {
                const btn = document.createElement('button')

                btn.addEventListener('click', event => {
                    if (i == total) { //skip按鈕
                        openPage(_d.nextPage)
                    } else {
                        if (!myAns) {
                            myAns = i
                            event.target.classList.add('active')
                            setTimeout(() => {
                                openPage(_d.nextPage)
                            }, 1000)
                        }
                    }
                })
                btn.classList.add('ansBtn', 'pos-' + i)
                ansBox.append(btn)

            }
        }
    }

    const QPlayerNumber = (data) => {
        const _d = data || {}
        let resAns = []
        if (_d.questID && _d.soundBtn && _d.soundSource && _d.nextPage) {
            const _btns = document.querySelectorAll(_d.questID + "-end .btnBox button")
            const _ansBox = document.querySelector(_d.questID + "-end .myAns")
            const renderAns = () => {
                if (resAns.length <= 5) {
                    resAns.map((value, index) => {
                        _ansBox.querySelector(".ans_" + (index + 1)).innerHTML = resAns[index]
                    })
                    if (resAns.length == 5) {
                        setTimeout(() => {
                            openPage(_d.nextPage)
                        }, 3000);
                    }
                } else {
                    console.log("full")
                }
            }
            soundPlayer(
                _d.soundBtn,
                null,
                _d.soundSource,
                () => {
                    setTimeout(() => {
                        openPage(_d.questID + "-end")
                    }, (_d.nextDelay ? _d.nextDelay : 1000))
                }
            )
            //遊戲
            _btns.forEach(btn => {

                btn.addEventListener('click', event => {
                    resAns.push(event.target.dataset.num)
                    renderAns()
                })
            })
        }
    }

    //#region QPlayerAB 播放器題型，然後二選一
    const QPlayerAB = (data) => {
        const _d = data || {}
        if (_d.questID && _d.soundBtn && _d.soundSource && _d.nextPage) {
            soundPlayer(
                _d.soundBtn,
                null,
                _d.soundSource,
                () => {
                    setTimeout(() => {
                        openPage(_d.questID+"-end")
                    }, (_d.nextDelay ? _d.nextDelay : 1000))
                }
            )
            if (_d.nextPage.length > 0 && _d.nextPage[1]) {

                document.querySelectorAll(_d.questID + "-end .ansBox .ansBtn").forEach(btn=>{
                    btn.addEventListener('click', () => {
                        openPage(_d.nextPage)
                    })
                })
            }
        }
    }
    //#endregion

    const QNumberSequence = data => {
        const _d = data || {}
        let resAns = []
        if (_d.questID && _d.nextPage) {
            const _btns = document.querySelectorAll(_d.questID + "-end .ballBox .ball")
            _btns.forEach(btn => {
                btn.addEventListener('click', event => {
                    if (resAns.length != 10 && !event.target.classList.contains('active')) {
                        event.target.classList.add('active')
                        resAns.push(event.target.dataset.val)
                        console.log(resAns)
                    }
                    if (resAns.length == 10) {
                        setTimeout(() => {
                            openPage(_d.nextPage)
                        }, 3000);
                    }
                    //renderAns()
                })
            })
        }
    }
    //#endregion

    const QPicName = data => {
        const _d = data || {}
        let resAns = []
        if (_d.questID && _d.nextPage) {
            document.querySelector(_d.questID + "-end .send").addEventListener('click', () => {
                openPage(_d.nextPage)
            })

        }
    }

    const QTakeABreak = data => {
        const _d = data || {}
        if (_d.questID && _d.nextPage) {
            //--save
            document.querySelector(_d.questID + "-end .next").addEventListener('click', () => {
                openPage(_d.nextPage)
            })
        }
    }

    const QPicAnswer = data => {
        const _d = data || {}
        if (_d.questID && _d.nextPage) {
            //--save
            document.querySelector(_d.questID + "-end .skip").addEventListener('click', () => {
                openPage(_d.nextPage)
            })
        }
    }

    const QPicCompare = data => {
        const _d = data || {}
        console.log(_d.questID)

        if (_d.questID && _d.nextPage) {
            //--save
            document.querySelector(_d.questID + "-end .skip").addEventListener('click', () => {
                openPage(_d.nextPage)
            })
        }
    }

    const QTypeText = data=>{
        const _d = data || {}
        if (_d.questID && _d.nextPage) {
            //--save
            document.querySelector(_d.questID + "-start .skip").addEventListener('click', () => {
                openPage(_d.nextPage)
            })
        }
    }
    //init
    closeAll()
    //特別處理(應急作法)
    document.querySelector(`#${currentPage}`).style.display = "flex"


    /*
        loadImgManager(
            'img',
            ['akar-icons_arrow-left.svg', 'back.svg', 'bg2_l.svg', 'bg3_l.svg', 'bg_l.jpg', 'bg_m.jpg', 'btn_main.svg', 'btn_secondary.svg', 'btn_skip.svg', 'bubble_q1.svg', 'bubble_q2.svg', 'bubble_q3.svg', 'bubble_q4.svg', 'bubble_q5.svg', 'bubble_q6.svg', 'bubble_q7.svg', 'chat_1.svg', 'chat_2.svg', 'chat_end.svg', 'chat_q1-1a.svg', 'chat_q1-1b.svg', 'chat_q1-1c.svg', 'chat_q2-1a.svg', 'chat_q2-1b.svg', 'chat_q3-1a.svg', 'chat_q4-1a.svg', 'circle-notch-solid.svg', 'deegooq_0.png', 'deegooq_0.svg', 'deegooq_1.svg', 'deegooq_2.svg', 'deegooq_3.svg', 'deegooq_4.svg', 'footer_1.svg', 'footer_corner.svg', 'g5-icons.svg', 'hand.svg', 'logo.svg', 'plant_1.png', 'plant_2.png', 'play_btn.svg', 'pleaseTurn.svg', 'Q2_btn_1.svg', 'Q2_btn_2.svg', 'Q3-1_intro.png', 'Q3-1_intro_L.png', 'Q3-2_intro.png', 'Q3-2_intro_L.png', 'Q3after.jpg', 'Q3before.jpg', 'Q4-1_intro.png', 'Q4-1_intro_L.png', 'Q4card.svg', 'Q4stepper.svg', 'q5-icons-map.jpg', 'q5-intro.svg', 'q5-left-1.svg', 'q5-left-2.svg', 'q5-left-3.svg', 'q5-right-1.svg', 'q5-right-2.svg', 'q5-right-3.svg', 'q6-intro.svg', 'q7-intro_1.svg', 'q7-intro_2.svg', 'Q7_icons_all.jpg', 'Q7_icons_all.svg', 'Q7_icons_known.svg', 'timer.svg'],
            () => {
                //img資料中的部分讀取完成後就先開啟頁面
                document.querySelector(".loading").classList.add('off')
            }
        )

        //內頁資料的讀取
        loadImgManager(
            'img_2',
            ['MCI_screen_C2_Q2_a.png', 'MCI_screen_C2_Q2_b.png', 'MCI_screen_C2_Q3_a.png', 'MCI_screen_C2_Q3_b.png', 'Q3-1-A.jpg', 'Q3-1-B.jpg', 'Q3-2-A.jpg', 'Q3-2-B.jpg', 'Q3-3-A.jpg', 'Q3-3-B.jpg', 'Q5-1-1-L.svg', 'Q5-1-1-R.svg', 'Q5-1-2-L.svg', 'Q5-1-2-R.svg', 'Q5-1-3-L.svg', 'Q5-1-3-R.svg', 'Q5-2-1-L.svg', 'Q5-2-1-R.svg', 'Q5-2-2-L.svg', 'Q5-2-2-R.svg', 'Q5-2-3-L.svg', 'Q5-2-3-R.svg', 'Q5-3-1-L.svg', 'Q5-3-1-R.svg', 'Q5-3-2-L.svg', 'Q5-3-2-R.svg', 'Q5-3-3-L.svg', 'Q5-3-3-R.svg', 'Q7-1-a.svg', 'Q7-1-b.svg', 'Q7-1-c.svg', 'Q7-1-d.svg', 'Q7-1-e.svg', 'Q7-1.svg', 'Q7-2-a.svg', 'Q7-2-b.svg', 'Q7-2-c.svg', 'Q7-2-d.svg', 'Q7-2-e.svg', 'Q7-2.svg', 'Q7-3-a.svg', 'Q7-3-b.svg', 'Q7-3-c.svg', 'Q7-3-d.svg', 'Q7-3-e.svg', 'Q7-3.svg', 'Q7-4-a.svg', 'Q7-4-b.svg', 'Q7-4-c.svg', 'Q7-4-d.svg', 'Q7-4-e.svg', 'Q7-4.svg', 'Q7-5-a.svg', 'Q7-5-b.svg', 'Q7-5-c.svg', 'Q7-5-d.svg', 'Q7-5-e.svg', 'Q7-5.svg', 'Q7-6-a.svg', 'Q7-6-b.svg', 'Q7-6-c.svg', 'Q7-6-d.svg', 'Q7-6-e.svg', 'Q7-6.svg']
        )

        
    */

    //TEST
    document.querySelector(".loading").classList.add('off')

    setBtnsHandler()
    setButtonGroup()

    //#region 讀取json設定檔
    fetch("./js/data.json", {
        method: 'GET'
    }).then(response => {
        if (response.ok) {
            return response.json();
        }
    }).then(res => {
        if (res) {
            return res
        } else {
            alert("取得資料失敗")
        }
    }).then(res => {
        //pages
        personal()
        setList(res)
        if (debbugMode) {

            mainData = res.list[debbugPack]
           // console.log("debbugMode 現在選擇題型" + (debbugPack + 1), mainData)
            document.querySelector("#selectPage").style.display = ' block'
            document.querySelector("#start .BPBtn").style.display = ' none'

            QPlayer({
                questID: "#Q1",
                soundSource: mainData.q6.quest[0].sound,
                nextPage: ["#Q2-start", "#tab1-start"]
            })

            QShapeSeperate({
                questID: "#Q2",
                nextPage: "#Q3-start"
            })

            QPlayerNumber({
                questID: "#Q3-1",
                soundBtn: "#Q3-1-start .playMp3Btn",
                soundSource: mainData.q6.quest[0].sound,
                nextPage: "#Q3-2-start"
            })

            QPlayerNumber({
                questID: "#Q3-2",
                soundBtn: "#Q3-2-start .playMp3Btn",
                soundSource: mainData.q6.quest[0].sound,
                nextPage: "#Q4-start"
            })

            QNumberSequence({
                questID: "#Q4",
                nextPage: "#Q5-start",
            })
            
            QPicName({
                questID: "#Q5",
                nextPage: "#Q1-end",
            })

            QTakeABreak({
                questID: "#tab1",
                nextPage: "#Q6-start",
            })

            QPlayer({
                questID: "#Q6",
                soundBtn: "#Q6-start .playMp3Btn",
                soundSource: mainData.q6.quest[0].sound,
                nextPage: ["#Q7-start", "#tab2-start"]
            })

            QPicAnswer({
                questID: "#Q7",
                nextPage: "#Q8-start",
            })

            QPlayerAB({
                questID: "#Q8",
                soundBtn: "#Q8-start .playMp3Btn",
                soundSource: mainData.q6.quest[0].sound,
                nextPage: "#Q9-start",
            })
            
            QPicCompare({
                questID: "#Q9",
                nextPage: "#Q10-start",
            })

            QTypeText({
                questID: "#Q10",
                nextPage: "#Q6-a1",
            })

            QTakeABreak({
                questID: "#tab2",
                nextPage: "#Q11-start",
            })

        } else if (window.localStorage.getItem('packNum')) {
            console.log("localStorage 現在選擇題型" + (parseInt(window.localStorage.getItem('packNum')) + 1), mainData)
            mainData = res.list[parseInt(window.localStorage.getItem('packNum'))]

        }
    }).catch(error => {
        console.error('json 取得失敗:', error)
    })
    //#endregion
})