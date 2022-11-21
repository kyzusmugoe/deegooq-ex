const surveycakeURL = 'https://www.surveycake.com/'
const sendDataURL = 'https://www.TEST.com/POST/API'

//頁面紀錄 從localStorage取得deegooq_current_page的頁面資料
let currentPage = 'start'
let collectData ={}
if(window.localStorage.getItem('deegooq_current_page')){
    currentPage = window.localStorage.getItem('deegooq_current_page')
    console.log('deegooq_current_page', currentPage)
}

currentPage = 'start'

//使用者資料 從localStorage取得deegooq_current_page的頁面資料
if(window.localStorage.getItem('deegooq_current_data') && currentPage != 'start'){
    collectData =JSON.parse( window.localStorage.getItem('deegooq_current_data'))
    console.log('deegooq_current_page', collectData)
}


//讀取圖片資源管理
const loadImgManager = ()=>{
    const assetsList = ['logo.svg', 'btn_main.svg', 'btn_secondary.svg', 'Q3before.jpg', 'Q3after.jpg', 'bg_l.jpg', 'Q4-1_intro_L.png','plant_2.png','plant_1.png','bg_m.jpg', 'Q4-1_intro.png', 'Q3-2_intro.png', 'Q3-1_intro.png','Q3-2_intro_L.png', 'Q3-1_intro_L.png', 'bg2_l.svg', 'bg3_l.svg','pleaseTurn.svg','chat_q3-1a.svg','chat_q4-1a.svg','btn_main.svg','chat_q2-1a.svg','chat_q1-1a.svg','hand.svg','chat_q1-1c.svg','chat_1.svg','chat_2.svg','deegooq_0.svg','deegooq_1.svg','deegooq_2.svg','deegooq_3.svg','bubble_q2.svg','bubble_q3.svg','bubble_q4.svg','bubble_q5.svg','footer_corner.svg','deegooq_4.svg','bubble_q1.svg','timer.svg','btn_secondary.svg','play_btn.svg','chat_q1-1b.svg','chat_q2-1b.svg','chat_end.svg','Q2_btn_1.svg','Q2_btn_2.svg','akar-icons_arrow-left.svg','back.svg','btn_skip.svg','footer_1.svg','circle-notch-solid.svg','Q4stepper.svg','Q4card.svg']
    let ct = 0
    const loadImgAssets = url =>{
        const img = new Image()
        img.src= url
        img.onload = ()=>{
            console.log(`image ${assetsList[ct]} load complete`)
            ct++
            if(ct<assetsList.length){   
                loadImgAssets(`./img/${assetsList[ct]}`)
            }else{
                console.log('load all img complete')
                document.querySelector(".loading").classList.add('off')
            }
        }
    }
    loadImgAssets(`./img/${assetsList[ct]}`)
}



//防止double tap 測試
window.onload = () => {
    document.addEventListener('touchstart', (event) => {
      if (event.touches.length > 1) {
         event.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        event.preventDefault();
      }
      lastTouchEnd = now;
    }, false);
}

document.addEventListener('DOMContentLoaded', () => {
    
    //#region 偵測頁面方向
    const detectOrientation =  () => {
        //console.log(window.orientation )
        if(window.orientation == 90  || window.orientation == -90 ){
            document.querySelector(".app.landscape").style.display = 'flex'
            document.querySelector(".app.portrait").style.display = 'none'
        }else{
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
    
    const openPage = pageID =>{
        closeAll()
        document.querySelector(pageID).style.display = "flex"
    }

    //將所有的pageBtn設定click後的行為
    const setBtnsHandler = () => {
        btns.forEach(btn => {
            btn.addEventListener("click", event => {
                const pageID = event.currentTarget.dataset.id
                window.localStorage.setItem('deegooq_current_page', pageID)//設定當前頁面
                openPage(`#${pageID}`)
            })
        })
    }
    //#endregion

    //#region 資料收集器 data collector
    const setDataCollector = (key, value)=>{
        collectData = {
            ...collectData,
            [key]:value
        }
        window.localStorage.setItem('deegooq_current_data', JSON.stringify(collectData))
        console.log(collectData)
    }
    //#endregion

    //#region 資料上傳-尚未處理，須確定在哪個階段
    const sendDataToServer = ()=>{}
    
    //#endregion
 
    //#region 個人資料的button group
    const setButtonGroup = ()=>{
        document.querySelectorAll(".button-group").forEach(btn=>{
            btn.addEventListener("click", event=>{
                const _t = event.currentTarget
                const _g = _t.dataset.group
                const _v = _t.dataset.value
                document.querySelectorAll(`.button-group[data-group=${_g}]`).forEach(gBtn=>{
                    gBtn.classList.remove('on')
                })
                _t.classList.add('on')
                setDataCollector(_g, _v)
            })
        })
    }
    //#endregion

    document.querySelector("#goSurveycake").addEventListener('click',()=>{
        window.localStorage.setItem('deegooq_current_page', 'start')//設定當前頁面
        setTimeout(() => {
            window.open(surveycakeURL, '_self')
        }, 100);
    })

    //#region 計時器元件
    const setTimer = (ct, VID, endF)=>{
        let _ct = ct
        const timer = setInterval(()=>{
            console.log(`${VID} timer count left ${_ct}`)
            _ct--
            document.querySelector(VID).innerHTML = _ct
            if(_ct == 0){
                endF()
            }
        }, 1000);
        
        return timer
    }
    //#endregion

    //#region personal個資同意書 
    const personal = ()=>{
        document.querySelector('#isAgree').addEventListener('click', event=>{
            
            event.target.checked?
            document.querySelector('#sendArgee').classList.remove('off'):
            document.querySelector('#sendArgee').classList.add('off')
        })
    }
    //#endregion

    //#region Q1購買清單
    const q1=()=>{
        let sw = true
        const _progress =  document.querySelector("#Q1progress .bar")
        document.querySelector("#Q1PlayMp3").addEventListener("click", ()=>{
            if(!sw) return
            sw = false
            let mp3 = new Audio()
            //mp3.src="./mp3/Q1.mp3"
            mp3.src="./mp3/MCI_screen_E3_Q1.m4a"
            mp3.play()
            /*mp3.addEventListener("canplaythrough",()=>{
                mp3.play()
            })*/            
            mp3.addEventListener('ended', ()=>{
                sw = true
                document.querySelector("#Q1isListened").removeAttribute("style")
                _progress.style.width = `${0}%`
            })
            
            mp3.addEventListener('timeupdate', ()=>{
                _progress.style.width = `${Math.floor((mp3.currentTime/mp3.duration)*100)}%`
            })
        })

        const needBuyList= []
        let Q1Timer

        const endOfQ1 = ()=>{
            clearInterval(Q1Timer)
            setDataCollector('Q1', needBuyList)
            setTimeout(() => {    
                openPage('#end')
            }, 1000);
            window.localStorage.setItem('deegooq_current_page', 'end')//設定當前頁面
        }

        document.querySelectorAll('#Q1-3 .needBuy').forEach(btn=>{
            btn.addEventListener('click', event=>{
                if(!btn.classList.contains('on')){
                    btn.classList.add('on')
                    //event.target.disabled = true
                    needBuyList.push(event.target.dataset.buy)
                    //console.log(needBuyList)
                    if(needBuyList.length == 5){
                        endOfQ1()
                    }
                }else{
                    console.log("選過了")
                }
            })
        })

        
        document.querySelector("#startQ1Timer").addEventListener('click',()=>{
            clearInterval(Q1Timer)
            Q1Timer = setTimer(40, "#Q1Timer .value",()=>{
                endOfQ1()
            })
        })
    }
    //#endregion

    //#region Q2 執行力-聽語音點選數字
    const q2=()=>{

        let sw = true;
        const a1 = [9,4,2,7,8]//正確答案
        let a2 = []//回答的收集容器
        let last
        const _progress =  document.querySelector("#Q2progress .bar")

        const renderMySelection = ()=>{
            //document.querySelector(".mySelection").innerHTML = a2.toString()
            const sn = a2.length
            const _curent = document.querySelector(`.mySelection .Q2-2_answer:nth-child(${a2.length})`)
            _curent.classList.add('on', 'current')
            _curent.querySelector('.value').innerHTML = a2[a2.length-1]
            if(last){
                last.classList.remove('current')
            }
            last = _curent
        }
        
        document.querySelector("#Q2PlayMp3").addEventListener("click", ()=>{
            if(!sw) return
            sw = false
            let mp3 = new Audio()
            //mp3.src="./mp3/87249.mp3"
            mp3.src="./mp3/Normal_screen_B1_b1.m4a"
            mp3.play()
            /*mp3.addEventListener("canplaythrough",()=>{
                mp3.play()
            })*/
            mp3.addEventListener('ended', ()=>{
                setTimeout(() => {
                    setDataCollector('Q2', a2)
                    openPage("#Q2-2")
                }, 1000);
            })
            mp3.addEventListener('timeupdate', ()=>{
                _progress.style.width = `${Math.floor((mp3.currentTime/mp3.duration)*100)}%`
            })
        })

        document.querySelectorAll(".Q2-2_numbers").forEach(btn=>{
            btn.addEventListener("click", event=>{                                
                if(a2.length < 5){
                    const num = event.target.dataset.num
                    a2.push(num)
                    renderMySelection()                
                    if(a2.length == 5){
                        setTimeout(() => {
                            openPage("#Q3-1")    
                        }, 1000);
                    }
                }
            })
        })
    } 
    //#endregion

    //#region Q3 執行力-大家來找碴
    const q3 = ()=>{
        //計時器
        let Q3BTimer
        let Q3ATimer

        //按鈕位置使用百分比定位，radius決定觸碰區域的大小，也是使用百分比
        const BID = "Q3-4"
        const board = document.querySelector(`#${BID} .board`)
        let ans=[]//蒐集使用者點擊過後的資料

        const cBtnPos=[
            {left:52, top:40, radius:18, txt:'枕頭少了一個'},
            {left:50, top:58, radius:21, txt:'少了貓咪'},
            {left:30, top:70, radius:18, txt:'拖鞋方向變了'},
            {left:76, top:72, radius:21, txt:'地毯變圓的'},
            {left:2,  top:74, radius:18, txt:'凳子少一張'},
            {left:12, top:14, radius:18, txt:'窗外雲朵變了'},
            {left:30, top:30, radius:21, txt:'桌上蠟燭位置改變'},
           // {left:33, top:35, radius:12, txt:'蠟燭位置變了'},
            {left:48, top:2,  radius:18, txt:'吊燈少一個'},
            {left:78, top:5,  radius:18, txt:'牆上相框少一個'},

        ]
        
        cBtnPos.map(data=>{
            const _btn = document.createElement('div');
            board.appendChild(_btn)
            _btn.classList.add("cBtn")
            _btn.style.width = `${data.radius}%`
            //_btn.style.height = `${data.radius * (board.clientWidth / board.clientHeight)}%`
            _btn.style.height = `${data.radius * 1.49}%`
            _btn.style.left = `${data.left}%` 
            _btn.style.top = `${data.top}%`
            _btn.dataset.txt = data.txt
            //onsole.log(board.clientWidth / board.clientHeight)
        })

        //點擊後黃色點會變成空心
        const disableDots = ()=>{
            
            document.querySelectorAll(`#${BID} div.dotBox .dot`).forEach(( dot, index )=>{ 
                if(ans.length>index){
                    dot.classList.add('off')
                }else{
                    dot.classList.remove('off')
                }
            })       
        }

        const renderMesg = ()=>{
            const container = document.querySelector(`#${BID} div.message`)            
            while (container.firstChild) {
                container.removeChild(container.lastChild)
            }
            ans.map(a=>{
                const ansTxt = document.createElement('div')
                ansTxt.innerHTML = a
                container.appendChild(ansTxt)
            })
            disableDots()
        }

        

        //面板點選後的行為，找出點擊的時候是不是正確範圍
        board.addEventListener('click', event=>{
            const _t = event.target
            if(ans.length >= 5) return
            if(_t.classList.contains('cBtn')){
                _t.classList.add('on')
                let aready = false
                ans.map(txt=>{
                    if(txt== _t.dataset.txt){
                        aready = true
                    }
                })
                if(!aready){
                    ans.push(_t.dataset.txt)
                }else{
                    console.log('已經按過了')
                }
            }else{
                ans.push('答錯了')
            }
            renderMesg() 
            if(ans.length == 5){                
                setDataCollector('Q3', ans)
                clearInterval(Q3ATimer)
                setTimeout(() => {
                    openPage("#Q4-1")
                }, 1500);
            }       
        })

        const endOfQ3_4 = ()=>{
            clearInterval(Q3ATimer)
            openPage("#Q4-1")
            setDataCollector('Q3', ans)
        }

        document.querySelector("#startQ3beforeTimer").addEventListener('click',()=>{
            Q3BTimer = setTimer(30, "#Q3beforeTimer .value",()=>{
                openPage("#Q3-4")
                clearInterval(Q3BTimer)
                Q3ATimer = setTimer(40, "#Q3AfterTimer .value",()=>{
                    endOfQ3_4()
                })
            })
        })
        
        document.querySelector("#startQ3AfterTimer").addEventListener('click',()=>{
            clearInterval(Q3BTimer)
            Q3ATimer = setTimer(40, "#Q3AfterTimer .value",()=>{
                endOfQ3_4()
            })
        })

        document.querySelector("#Q3skip").addEventListener('click',()=>{
            endOfQ3_4()
        })
    }
    //#endregion

    //#region Q4 選顏色
    const q4 = ()=>{
        //const currentAns= ["紅","藍","綠","橙","紫"]
        const ans= []
        let step = 0

        const renderQuestColor =()=>{
            document.querySelectorAll("#Q4-2 .questColor").forEach((color, index)=>{
                if(step == index){
                    color.classList.add('on')
                }else{
                    color.classList.remove('on')
                }
            })
        }
        document.querySelectorAll("#Q4-2 .colorBtn").forEach(btn=>{
            btn.addEventListener('click', event=>{
                if(step<5){               

                    const _t = event.currentTarget 
                    /*
                    if(_t.classList.contains('on')){
                        return
                    }else{
                        _t.classList.add('on')
                    }*/
                    step++
                    renderQuestColor()
                    ans.push(_t.dataset.color)
                    if(step>=5){
                        setTimeout(() => {        
                        window.localStorage.setItem('deegooq_current_page', 'Q5-1')//設定當前頁面                    
                            setDataCollector('Q3', ans)
                            openPage("#Q5-1")
                        }, 1000);
                    }
                }
            })
        })
        renderQuestColor()
    }

    //#endregion

    //#region q5 畫時鐘
    const q5 = ()=>{        
        const canvas = document.querySelector("#drawCanvas");
        const pen =  document.querySelector("#pen")
        const eraser =  document.querySelector("#eraser")
        const signaturePad = new SignaturePad(canvas);
        /*
        const drawComplete = ()=>{
            //document.querySelector("#testDraw").src= signaturePad.toDataURL("image/jpeg")
            setDataCollector('Q5', signaturePad.toDataURL("image/jpeg"))
        }
        */

        const setPen = ()=>{
            signaturePad.penColor = '#000'
            signaturePad.maxWidth = 1
            pen.style.display = "none"
            eraser.style.display="block"
        }

        signaturePad.backgroundColor = '#fff'
        signaturePad.minWidth = 1
        signaturePad.maxWidth = 1
        signaturePad.clear()

        const resizeCanvas = ()=> {
            const _w = window.screen.width < 750 ? window.screen.width- 50 : 700 
            const _h = window.screen.width < 750 ? _w * 0.85 : _w *0.7
            
            canvas.width = _w
            canvas.height = _h
            //canvas.getContext("2d").scale(ratio, ratio);
            signaturePad.clear(); // otherwise isEmpty() might return incorrect value
        }
        
        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();


        let Q5Timer
        document.querySelector("#startQ5Timer").addEventListener('click',()=>{            
            Q5Timer = setTimer(60, "#Q5Timer .value",()=>{
                openPage("#Q1-2")
                clearInterval(Q5Timer)
            })
        })

        
        pen.addEventListener('click',()=>{
            setPen()
        })
        
        eraser.addEventListener('click',()=>{
            signaturePad.penColor = '#fff'
            signaturePad.maxWidth = 20
            pen.style.display="block"
            eraser.style.display="none"
        })
        
        const endOfQ5 = ()=>{            
            clearInterval(Q5Timer)
            openPage("#Q1-2")
            window.localStorage.setItem('deegooq_current_page', 'Q1-2')//設定當前頁面
            setDataCollector('Q5', signaturePad.toDataURL("image/jpeg"))
        }
        
        document.querySelector("#clearAll").addEventListener('click', ()=>{
            signaturePad.clear()
            setPen()
        })

        document.querySelector("#drawDone").addEventListener('click', ()=>{
            endOfQ5()
        })

        document.querySelector("#Q5Skip").addEventListener('click', ()=>{
            endOfQ5()
        })
    }
    //#endregion
    
    //init
    

    loadImgManager()
    closeAll()
    document.querySelector(`#${currentPage}`).style.display = "flex"
    setBtnsHandler()
    setButtonGroup()
    //pages
    personal()
    q1()
    q2()
    q3()
    q4()
    q5()

    
})