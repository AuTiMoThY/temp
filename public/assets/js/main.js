const appConfig = (function (window) {
    return {
        // isLogin
        // false: 未登入
        // true: 登入
        isLogin: false,
        // currentCnt
        // scratch_card: NO刮刮乐
        // smash_egg: NO砸金蛋
        // money_tree: NO摇钱树
        currentCnt: "scratch_card",
    };
})(window);

const app = createApp({
    components: {
        TwImg,
        TwBtn,
    },
    setup() {
        // 取元素和該元素高度
        const elementRefs = {
            headerMain: ref(null),
        };
        const heightRefs = {
            headerMain: ref(0),
        };
        const cssHeightVars = {
            headerMain: "--header-main-height",
        };

        // 登入狀態，預設未登入(false)
        const isLogin = ref(appConfig.isLogin);
        const user_id = ref("");
        const userIdErrorMsg = ref(null);

        // 登入視窗
        const loginPopup = ref(false);

        // 當前抽獎區塊
        const currentCnt = ref(appConfig.currentCnt);

        // 各抽獎區塊是否啟動
        const isScratchCardActive = ref(false);
        const isSmashEggActive = ref(false);
        const isMoneyTreeActive = ref(false);

        // 開獎動畫是否啟動
        const isEnterScratchCard = ref(false);
        const isEnterSmashEgg = ref(false);
        const isEnterMoneyTree = ref(false);

        // 獎品彈跳視窗
        const showBonusScratchCard = ref(false);
        const showBonusSmashEgg = ref(false);
        const showBonusMoneyTree = ref(false);

        let cursorTipAnimation = null;

        const updateElementHeight = (elementKey) => {
            const elementRef = elementRefs[elementKey];
            const heightRef = heightRefs[elementKey];
            const cssHeightVar = cssHeightVars[elementKey];

            nextTick(() => {
                heightRef.value = elementRef.value?.clientHeight || 0;
                document.documentElement.style.setProperty(cssHeightVar, `${heightRef.value}px`);
            });
        };

        const removeAllEnterStatus = () => {
            isEnterScratchCard.value = false;
            isEnterSmashEgg.value = false;
            isEnterMoneyTree.value = false;
            ["js-enterScratchCard", "js-enterSmashEgg", "js-enterMoneyTree"].forEach((className) => {
                document.body.classList.remove(className);
            });
        };
        const changeCnt = (cnt) => {
            if (cnt == currentCnt.value) return false;

            // if (isEnterScratchCard.value || isEnterSmashEgg.value || isEnterMoneyTree.value) {
            //     alert("尚未开奖完成");
            //     return false;
            // }

            currentCnt.value = cnt;

            isScratchCardActive.value = false;
            isSmashEggActive.value = false;
            isMoneyTreeActive.value = false;
            ["scratch_card", "smash_egg", "money_tree"].forEach((className) => {
                document.body.classList.remove(className);
            });
            document.body.classList.add(cnt);

            removeAllEnterStatus();
            // document.body.classList.remove("js-enterScratchCard");

            // 停止所有動畫
            gsap.killTweensOf(".scratch_card-hand, .smash_egg-hammer, .money_tree-hand");

            nextTick(() => {
                // // 砸金蛋開獎恢復成預設
                // resetEnterSmashEgg();

                startAni(cnt);
            });
        };

        // 抽獎區塊的開場動畫
        const startAni = (type) => {
            if (type == "scratch_card") {
                isScratchCardActive.value = true;
                nextTick(() => {
                    setTimeout(() => {
                        if (isLogin.value) {
                            handleEnterDraw("scratch_card");
                        }
                    }, 950);
                });
            }
            if (type == "smash_egg") {
                isSmashEggActive.value = true;
            }
            if (type == "money_tree") {
                isMoneyTreeActive.value = true;
            }
        };

        // 點擊右上角會員按鈕
        const handleUserClick = () => {
            loginPopup.value = true;
        };

        // 登入POPUP中，點擊登入按鈕
        const handleLoginClick = () => {
            // 有填寫欄位，設定登入狀態與清空錯誤訊息
            if (user_id.value) {
                userIdErrorMsg.value.innerHTML = "";
                isLogin.value = true;
                setTimeout(() => {
                    loginPopup.value = false;
                }, 300);

                if (document.body.classList.contains("scratch_card")) {
                    handleEnterDraw("scratch_card");
                }
            }
            // 未填寫欄位，顯示錯誤訊息
            else {
                userIdErrorMsg.value.innerHTML = "此栏位必填";
            }
        };

        const bonusChange = (type, state) => {
            setTimeout(() => {
                if (type == "scratch_card") {
                    showBonusScratchCard.value = state;
                }
                if (type == "smash_egg") {
                    showBonusSmashEgg.value = state;
                }
                if (type == "money_tree") {
                    showBonusMoneyTree.value = state;
                }
            }, 300);
        };

        const cursorTip = () => {
            gsap.killTweensOf(".scratch_card-cursor, .smash_egg-cursor, .money_tree-cursor");
            gsap.set(".scratch_card-cursor, .smash_egg-cursor, .money_tree-cursor", {scale: 1});
            cursorTipAnimation = gsap.to(".scratch_card-cursor, .smash_egg-cursor, .money_tree-cursor", {
                scale: 1.2,
                repeat: -1,
                yoyo: true,
                ease: "power1.inOut",
                duration: 0.5,
            });
            return cursorTipAnimation;
        };

        // 滑入抽獎區塊的鼠標變換
        const handlerEnterLeaveCursor = (bodyClass, targetElm) => {
            // function handleEnter() {
            //     document.body.classList.add(bodyClass);
            // }

            // function handleLeave() {
            //     document.body.classList.remove(bodyClass);
            // }
            // targetElm.addEventListener("mouseenter", handleEnter);
            // targetElm.addEventListener("mouseleave", handleLeave);
            // targetElm.addEventListener("touchstart", handleEnter);
            // targetElm.addEventListener("touchend", handleLeave);

            // const userAgent = navigator.userAgent || navigator.vendor || window.opera;

            // 檢查是否為一般的行動裝置關鍵字
            // if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {

            // }
            // targetElm.addEventListener("click", handleEnter);
            let rect;
            document.body.classList.add("js-showCursor");
            function updateCoordinates(x, y) {
                document.documentElement.style.setProperty("--block-x", x);
                document.documentElement.style.setProperty("--block-y", y);
            }
            function resetCursor() {
                const centerX = targetElm.clientWidth / 2;
                const centerY = targetElm.clientHeight / 2;

                updateCoordinates(centerX, centerY);
            }

            const cursorUpdate = _.debounce(() => {
                targetElm.addEventListener("pointerenter", function (event) {
                    rect = targetElm.getBoundingClientRect();
                });
                targetElm.addEventListener("pointermove", function (event) {
                    console.log("pointermove");
                    const x = event.clientX - rect.left;
                    const y = event.clientY - rect.top;

                    updateCoordinates(x, y);
                });

                // targetElm.addEventListener("pointerleave", function (event) {
                //     console.log("pointerleave");
                //     resetCursor();
                // });
            }, 66);
            resetCursor();
            cursorUpdate();
            window.addEventListener("resize", cursorUpdate);
        };

        // 開獎動畫
        const handleEnterDraw = (type) => {
            removeAllEnterStatus();
            if (!isLogin.value) {
                loginPopup.value = true;
                return false;
            }

            if (type == "scratch_card") {
                isEnterScratchCard.value = true;
                document.body.classList.add("js-enterScratchCard");
                nextTick(() => {
                    cursorTip();
                    const canvas = document.querySelector("#sc-cvs");
                    const box = document.querySelector(".scratch_card-box");
                    // dist\assets\js\scratchCardMaskImage.js
                    const maskImageSrc = scratchCardMaskImage;
                    // dist\assets\js\enterScratchCard.js
                    enterScratchCard.setupCanvases(canvas, box, maskImageSrc, bonusChange);

                    gsap.killTweensOf(".scratch_card-hand");
                    gsap.set(".scratch_card-hand", {
                        x: 0,
                        y: 0,
                        rotation: 0,
                    });

                    // 區塊的滑鼠切換成圖片
                    handlerEnterLeaveCursor("js-showScratchCardHand", box);
                });
            }
            if (type == "smash_egg") {
                isEnterSmashEgg.value = true;

                nextTick(() => {
                    cursorTip();
                    // 區塊的滑鼠切換成圖片
                    const block = document.querySelector(".smash_egg-cracks_glow-group");
                    handlerEnterLeaveCursor("js-showSmashEggHammer", block);

                    // 該區塊中的點擊事件
                    block.addEventListener("click", () => {
                        // dist\assets\js\smashEggAni.js
                        enterSmashEgg(bonusChange);
                        cursorTipAnimation.pause();
                    });
                });
            }
            if (type == "money_tree") {
                isEnterMoneyTree.value = true;
                nextTick(() => {
                    cursorTip();
                    // 區塊的滑鼠切換成圖片
                    const block = document.querySelector(".money_tree-enter-group");
                    handlerEnterLeaveCursor("js-showMoneyTreeHand", block);

                    // 該區塊中的點擊事件
                    block.addEventListener("click", () => {
                        // dist\assets\js\moneyTreeAni.js
                        enterMoneyTree(bonusChange);
                        cursorTipAnimation.pause();
                    });
                });
            }
        };

        // 在獲獎彈窗中，點擊確認按鈕
        const handleBonusConfirmClick = (type) => {
            bonusChange(type, false);
            if (type == "scratch_card") {
                if (isLogin.value) {
                    handleEnterDraw("scratch_card");
                    cursorTipAnimation.play();
                } else {
                    isEnterScratchCard.value = false;
                    // document.body.classList.remove("js-enterScratchCard");
                }
            }
            if (type == "smash_egg") {
                isEnterSmashEgg.value = false;
            }
            if (type == "money_tree") {
                isEnterMoneyTree.value = false;
            }
        };

        // 切換抽獎區塊
        // 監聽 isScratchCardActive 變化
        watch(isScratchCardActive, (newVal, oldVal) => {
            if (newVal) {
                // console.log("isScratchCardActive", newVal);
                resetSmashEggAni();
                resetMoneyTreeAni();
                scratchCardAni();
            }
        });
        // 監聽 isSmashEggActive 變化
        watch(isSmashEggActive, (newVal, oldVal) => {
            if (newVal) {
                // console.log("isSmashEggActive", newVal);
                resetScratchCardAni();
                resetMoneyTreeAni();
                smashEggAni();
            }
        });
        // 監聽 isMoneyTreeActive 變化
        watch(isMoneyTreeActive, (newVal, oldVal) => {
            if (newVal) {
                // console.log("isMoneyTreeActive", newVal);
                resetScratchCardAni();
                resetSmashEggAni();
                moneyTreeAni();
            }
        });

        // 開獎動畫們的監聽
        // 監聽 isEnterScratchCard 變化
        watch(isEnterScratchCard, (newVal, oldVal) => {
            console.log("isEnterScratchCard", newVal, oldVal);
            if (newVal) {
                document.body.classList.add("js-enterScratchCard");
            } else {
                document.body.classList.remove("js-enterScratchCard");
            }
        });
        // 監聽 isEnterSmashEgg 變化
        watch(isEnterSmashEgg, (newVal, oldVal) => {
            console.log("isEnterSmashEgg", newVal, oldVal);
            if (newVal) {
                document.body.classList.add("js-enterSmashEgg");
            } else {
                document.body.classList.remove("js-enterSmashEgg");
                nextTick(() => {
                    resetEnterSmashEgg();
                });
            }
        });
        // 監聽 isEnterMoneyTree 變化
        watch(isEnterMoneyTree, (newVal, oldVal) => {
            console.log("isEnterMoneyTree", newVal, oldVal);
            if (newVal) {
                document.body.classList.add("js-enterMoneyTree");
            } else {
                document.body.classList.remove("js-enterMoneyTree");
            }
        });

        const debouncedUpdate = _.debounce(() => {
            Object.keys(elementRefs).forEach(updateElementHeight);
        }, 300);

        // onBeforeMount(() => {
        //     console.log('Before mount')
        //   })
        onMounted(() => {
            console.log(isLogin.value);
            document.addEventListener("pointermove", function ({x, y}) {
                document.documentElement.style.setProperty("--x", x);
                document.documentElement.style.setProperty("--y", y);
            });

            gsap.registerPlugin();

            document.body.classList.add(currentCnt.value);

            resetScratchCardAni();
            resetSmashEggAni();
            resetMoneyTreeAni();
            startAni(currentCnt.value);

            // dist\assets\js\winnerSwiper.js
            winnerSwiper();

            debouncedUpdate();
            window.addEventListener("resize", debouncedUpdate);
        });
        onUnmounted(() => {
            window.removeEventListener("resize", debouncedUpdate);
        });
        return {
            ...elementRefs,
            user_id,
            userIdErrorMsg,
            loginPopup,
            changeCnt,
            isEnterScratchCard,
            isEnterSmashEgg,
            isEnterMoneyTree,
            showBonusScratchCard,
            showBonusSmashEgg,
            showBonusMoneyTree,
            handleUserClick,
            handleLoginClick,
            handleEnterDraw,
            handleBonusConfirmClick,
        };
    },
});

app.mount("#app");
