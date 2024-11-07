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
        const setViewportHeight = () => {
            let vh = window.innerHeight;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        };
        onMounted(() => {
            // 初始設置視口高度
            setViewportHeight();
            // 監聽 resize 事件
            window.addEventListener("resize", setViewportHeight);
        });
        onUnmounted(() => {

        });
        return {

        };
    },
});

app.mount("#app");
