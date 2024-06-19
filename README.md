登入狀態(isLogin)由vue控制
dist\assets\js\main.js
```
const app = createApp({
    ...省略
    setup() {
        // 登入狀態，預設未登入(false)
        const isLogin = ref(false);
        const user_id = ref('');
        const userIdErrorMsg = ref(null);

        ...省略

        // 點擊登入按鈕
        const handleLoginClick = () => {
            // 有填寫欄位，設定登入狀態與清空錯誤訊息
            if (user_id.value) {
                userIdErrorMsg.value.innerHTML = "";
                isLogin.value = true;
                ...省略
            }
            // 未填寫欄位，顯示錯誤訊息
            else {
                userIdErrorMsg.value.innerHTML = "此栏位必填";
            }
        };

        ...省略

        
        // 在抽獎區塊中，點擊抽獎按鈕
        const handleGetBonusClick = (type) => {
            // 登入狀態時，顯示獲獎訊息
            if(isLogin.value) {
                bonusChange(type, true);
            }
            // 未登入狀態時，跳出登入彈窗
            else {
                loginPopup.value = true;
            }
        }

        ...省略


        return {
            user_id,
            userIdErrorMsg,
            ...省略
        };
    },
});

app.mount("#app");


```