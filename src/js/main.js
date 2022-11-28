const surveycakeURL = 'https://www.surveycake.com/'
const sendDataURL = 'https://www.TEST.com/POST/API'

//頁面紀錄 從localStorage取得deegooq_current_page的頁面資料
let currentPage = 'start'
let collectData ={}
if(window.localStorage.getItem('deegooq_current_page')){
    currentPage = window.localStorage.getItem('deegooq_current_page')
    console.log('deegooq_current_page', currentPage)
}

//測試
currentPage = 'Q6-1'

//主要資料物件
let mainData = {}

//使用者資料 從localStorage取得deegooq_current_page的頁面資料
if(window.localStorage.getItem('deegooq_current_data') && currentPage != 'start'){
    collectData =JSON.parse( window.localStorage.getItem('deegooq_current_data'))
    //console.log('deegooq_current_page', collectData)
}

//#region 讀取圖片資源管理
const loadImgManager = ()=>{
    const assetsList = ['logo.svg']
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
//#endregion

//#region  防止double tap 測試
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
//#endregion

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

    //#region 語音播放元件
    const soundPlayer = (btnID, barID, soundPath, complete)=>{
        let sw = true;
        const _progress =  document.querySelector(barID)
        document.querySelector(btnID).addEventListener("click", ()=>{
            if(!sw) return
            sw = false
            let mp3 = new Audio()
            mp3.src= soundPath
            mp3.play()
            mp3.addEventListener('ended', ()=>{
                complete()
            })
            mp3.addEventListener('timeupdate', ()=>{
                _progress.style.width = `${Math.floor((mp3.currentTime/mp3.duration)*100)}%`
            })
        })
    }
    //#endregion

    //#region 題庫列表    
    const setList = data =>{
        const box = document.querySelector('#listBox')
        data.list.map(( row, index )=>{
            const btn = document.createElement('button')
            btn.innerHTML = row.title
            btn.dataset.sn = index
            btn.addEventListener('click', event=>{
                mainData = data.list[event.target.dataset.sn]
                q1()
                q2()
                q3()
                q4()
                q5ex()
                q6()
                q7()
                openPage('#Q1-1')
            })
            box.appendChild(btn)
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
            mp3.src= mainData.q1.sound
            mp3.play()           
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

        const btnBox = document.querySelector("#Q1-3 .btnBox")
        mainData.q1.answer.map(btnTxt =>{
            const btn = document.createElement('button')
            btn.innerHTML = btnTxt
            btn.classList.add('needBuy')
            btn.dataset.buy = btnTxt
            btn.addEventListener('click', event=>{
                if(!btn.classList.contains('on')){
                    btn.classList.add('on')
                    needBuyList.push(event.target.dataset.buy)
                    if(needBuyList.length == 5){
                        endOfQ1()
                    }
                }else{
                    console.log("選過了")
                }
            })

            btnBox.appendChild(btn)
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
        //const a1 = [9,4,2,7,8]//正確答案
        const a1 = mainData.q2.answer//正確答案
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
            //mp3.src="./mp3/Normal_screen_B1_b1.m4a"
            mp3.src= mainData.q2.sound
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
        
        const cBtnPos=mainData.q3.pos
        document.querySelector("#Q3-3 img.Q3before").src=mainData.q3.before
        document.querySelector("#Q3-4 img.Q3after").src=mainData.q3.after

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
        const colorBox =  document.querySelector("#Q4-2 .questColorBox")
        const btnBox =  document.querySelector("#Q4-2 .colorBtnBox")
        let step = 0
        
        mainData.q4.quest.map(item=>{
            const card = document.createElement('span')
            card.classList.add('questColor')
            card.style.color = item.color
            card.innerHTML = item.txt
            colorBox.appendChild(card)
        })

        const renderQuestColor =()=>{
            document.querySelectorAll("#Q4-2 .questColor").forEach((color, index)=>{
                if(step == index){
                    color.classList.add('on')
                }else{
                    color.classList.remove('on')
                }
            })
        }

        mainData.q4.ans.map(item=>{
            const btn = document.createElement('button')
            btn.classList.add('colorBtn')
            btn.dataset.color = item.val
            btn.innerHTML = item.txt
            btn.addEventListener('click', event=>{
                if(step<5){
                    const _t = event.currentTarget                   
                    step++
                    renderQuestColor()
                    ans.push(_t.dataset.color)
                    if(step>=5){
                        setTimeout(() => {        
                        window.localStorage.setItem('deegooq_current_page', 'Q5-1')//設定當前頁面                    
                            setDataCollector('Q3', ans)
                            openPage("#Q5ex-1")
                        }, 1000);
                    }
                }
            })
            btnBox.appendChild(btn)
        })
        /*
        document.querySelectorAll("#Q4-2 .colorBtn").forEach(btn=>{
            btn.addEventListener('click', event=>{
                if(step<5){
                    const _t = event.currentTarget                   
                    step++
                    renderQuestColor()
                    ans.push(_t.dataset.color)
                    if(step>=5){
                        setTimeout(() => {        
                        window.localStorage.setItem('deegooq_current_page', 'Q5-1')//設定當前頁面                    
                            setDataCollector('Q3', ans)
                            openPage("#Q5ex-1")
                        }, 1000);
                    }
                }
            })
        })
        */
        renderQuestColor()
    }

    //#endregion

    //#region Q5 畫時鐘 EX版棄用
    /*
    const q5 = ()=>{        
        const canvas = document.querySelector("#drawCanvas");
        const pen =  document.querySelector("#pen")
        const eraser =  document.querySelector("#eraser")
        const signaturePad = new SignaturePad(canvas);
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
    */
    //#endregion
    
    //#region Q5ex 
    const q5ex = ()=>{
        const q5exAns=[]//使用者回答的資料
        
        let sn=0;
        let Q5exTimer
        const snTxt = document.querySelector("#Q5ex-2 .infoBox .sn")
        const box = document.querySelector("#q5QuestBox")
        const leftBox = box.querySelector(".left")
        const rightBox = box.querySelector(".right")
       
        
        const renderIcon = (box, item)=>{
            const icon = document.createElement('div')
            icon.classList.add('q5Icon', `icon-${item}`)
            box.append(icon)
        }

        const renderIconBox = ()=>{               
            const _d = mainData.q5.quest[sn]
            leftBox.classList.add(`grid-${_d.type}`)
            rightBox.classList.add(`grid-${_d.type}`)
            while (leftBox.firstChild) {
                leftBox.removeChild(leftBox.lastChild)
            }
            while (rightBox.firstChild) {
                rightBox.removeChild(rightBox.lastChild)
            }
            _d.left.map(item=>{ renderIcon(leftBox, item) })
            _d.right.map(item=>{ renderIcon(rightBox, item) })
        }

        const setQ5Timer=()=>{
            Q5exTimer = setTimer(10, "#Q5exTimer .value",()=>{
                clearInterval(Q5exTimer)
                sn++
                
                if(mainData.q5.quest[sn]){   
                    renderIconBox()
                    setQ5Timer()
                    snTxt.innerHTML = String(sn+1)
                }else{
                    openPage("#Q6-1")
                } 
            })
        }

        document.querySelector("#startQ5exTimer").addEventListener('click',()=>{            
            setQ5Timer()
        })
        
        renderIconBox()
        document.querySelectorAll("#Q5ex-2 .ansBtn").forEach(btn=>{
            btn.addEventListener('click', event=>{
                q5exAns.push(event.target.dataset.ans)
                clearInterval(Q5exTimer)
                sn++
                if(mainData.q5.quest[sn]){   
                    renderIconBox()
                    setQ5Timer()
                    snTxt.innerHTML = String(sn+1)
                }else{
                    setDataCollector('Q5', q5exAns)
                    openPage("#Q6-1")
                }                
            })
        })
    }
    //#endregion  

    //#region Q6
    const q6 = ()=>{
        let sn=0
        let ansRes = []//所有的回答
        let ansBox = document.querySelector("#Q6-3 .mySelection")
        const renderMySelection = data =>{
            let last
            const sn = data.answers.length
            const _curent = document.querySelector(data.current)
            _curent.classList.add('on', 'current' , parseInt(data.answers)? "isNum" : "isTxt")
            _curent.querySelector('.value').innerHTML = data.answers
            
            if(last){
                last.classList.remove('current')
            }
            last = _curent
        }
        //----
        let res = []//回答的收集容器
        const render = ()=> {
            //題目卡
            ansBox.className=""
            ansBox.classList.add("mySelection", `grid-${mainData.q6.quest[sn].num}`)
            document.querySelector("#Q6-1 .total").innerHTML = mainData.q6.quest[sn].num
            document.querySelector("#Q6-2 .total").innerHTML = mainData.q6.quest[sn].num
            document.querySelector("#Q6-3 .total").innerHTML = mainData.q6.quest[sn].num
            document.querySelector("#Q6-2 .mesg").innerHTML = mainData.q6.quest[sn].mesg
            while (ansBox.firstChild) {
                ansBox.removeChild(ansBox.lastChild)
            }

            for(let i=0;i<mainData.q6.quest[sn].num;i++){
                let card = document.createElement('div')
                let val = document.createElement('span')
                val.innerHTML = "?" 
                val.classList.add('value')
                card.classList.add('Q6_answer')
                card.appendChild(val)
                ansBox.appendChild(card)                
            }
            
            soundPlayer(
                "#Q6-2_PlayMp3",
                "#Q6-2_Progress .bar",
                mainData.q6.quest[sn].sound,
                ()=>{
                    setTimeout(() => {
                        openPage("#Q6-3")
                    }, 1000)
                }
            )
        }

        document.querySelectorAll("#Q6-3 .Q6_btn").forEach(btn=>{
            btn.addEventListener("click", event=>{            
                const ans = event.target.dataset.ans  
                if(res.length < parseInt(mainData.q6.quest[sn].num)+1){
                    res.push(ans)
                    renderMySelection({
                        current: `#Q6-3 .mySelection .Q6_answer:nth-child(${res.length}`,
                        answers: res[res.length-1]
                    })
                    if(res.length == mainData.q6.quest[sn].num){
                        setTimeout(() => {
                            sn++
                            ansRes.push(res)
                            res=[]
                            if(mainData.q6.quest[sn]){
                                openPage("#Q6-2")
                                render()                           
                            }else{
                                openPage("#Q7-1") 
                            }
                        }, 1000);
                    }
                }
            })
        })
        
        render()
    }
    //#endregion

    //#region Q7
    const q7 = ()=>{
        let sn = 0
        const q7Ans=[]//使用者回答的資料
        const qBox = document.querySelector("#q7QuestBox .qBox")
        const aBox = document.querySelector("#q7QuestBox .aBox")
        const renderQ7=()=>{   
            const _d  = mainData.q7.quest[sn]
            qBox.className="";
            qBox.classList.add("qBox", `grid-${_d.type}`)
            while (qBox.firstChild) {
                qBox.removeChild(qBox.lastChild)
            }
            _d.qBox.map(val =>{
                const icon = document.createElement('div')
                icon.classList.add('q7qIcon', `icon-${val=="?" ? "known" : val }`)
                qBox.appendChild(icon)
                
            })
            while (aBox.firstChild) {
                aBox.removeChild(aBox.lastChild)
            }
            _d.aBox.map(val =>{
                const _box = document.createElement('div')
                const _icon = document.createElement('div')
                _box.classList.add('q7aBox')
                _icon.classList.add('q7aIcon', `icon-${val}`)
                _box.dataset.val = val            
                _box.appendChild(_icon)            
                _box.addEventListener('click', event=>{
                    q7Ans.push(_d.ans == event.currentTarget.dataset.val ? "Y" : "N")
                    sn++
                    console.log(mainData.q7.quest[sn])
                    if(mainData.q7.quest[sn]){
                        openPage("#Q7-3")
                        renderQ7()
                    }else{
                        setDataCollector('Q7', q7Ans)
                        openPage("#Q1-3")
                    }
                })
                aBox.appendChild(_box)
            }) 
        }
        renderQ7()
    }


    //#endregion
    //init
    closeAll()
    document.querySelector(`#${currentPage}`).style.display = "flex"
    loadImgManager()
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
        mainData = res
        //pages
        personal()
        setList(res)
        //test
            mainData = res.list[0]
            q1()
            q2()
            q3()
            q4()
            q5ex()
            q6()
            q7()
    }).catch(error => {
        console.error('json 取得失敗:', error)
    });
    //#endregion
})